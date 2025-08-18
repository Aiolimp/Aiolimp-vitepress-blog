---
title: 前端使用SSE实现AI流式输出
theme: solarized-dark
---

# 前端使用 SSE 实现 AI 流式输出

## 1. SSE 简介

### 1.1 什么是 SSE

SSE (Server-Sent Events) 是一种允许服务器向客户端推送数据的技术，特别适合实现实时数据流，如 AI 对话、实时通知等场景。

```javascript
// SSE 基本概念
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (event) => {
  console.log('接收到数据:', event.data);
};
```

### 1.2 SSE vs WebSocket vs 轮询

| 特性       | SSE                   | WebSocket      | 轮询         |
| ---------- | --------------------- | -------------- | ------------ |
| 连接方式   | 单向(服务器->客户端)  | 双向           | 请求-响应    |
| 协议       | HTTP                  | WebSocket 协议 | HTTP         |
| 自动重连   | 内置支持              | 需要手动实现   | 无需重连     |
| 浏览器支持 | 广泛支持              | 广泛支持       | 完全支持     |
| 复杂度     | 简单                  | 中等           | 简单但低效   |
| 适用场景   | AI 流式输出、实时通知 | 即时通讯、游戏 | 简单状态查询 |

### 1.3 SSE 的优势

- **自动重连**: 网络断开时自动重新连接
- **简单易用**: 基于 HTTP 协议，无需复杂配置
- **事件类型**: 支持自定义事件类型
- **浏览器支持**: 主流浏览器原生支持

## 2. 基础实现

### 2.1 客户端基本用法

```javascript
// 创建 SSE 连接
function createSSEConnection(url) {
  const eventSource = new EventSource(url);

  // 连接建立
  eventSource.onopen = (event) => {
    console.log('SSE 连接已建立');
  };

  // 接收消息
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('接收到消息:', data);
  };

  // 连接错误
  eventSource.onerror = (event) => {
    console.error('SSE 连接错误:', event);
  };

  return eventSource;
}

// 使用示例
const sse = createSSEConnection('/api/ai-stream');
```

### 2.2 服务端实现 (Node.js)

```javascript
// Express.js 服务端实现
const express = require('express');
const app = express();

app.get('/api/ai-stream', (req, res) => {
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // 发送数据
  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 模拟 AI 流式响应
  const words = ['你好', '我是', 'AI', '助手', '有什么', '可以', '帮助', '您的', '吗？'];
  let index = 0;

  const interval = setInterval(() => {
    if (index < words.length) {
      sendData({ content: words[index], done: false });
      index++;
    } else {
      sendData({ content: '', done: true });
      clearInterval(interval);
      res.end();
    }
  }, 300);

  // 客户端断开连接时清理
  req.on('close', () => {
    clearInterval(interval);
  });
});
```

## 3. AI 流式输出实现

### 3.1 React Hook 实现

```typescript
// useSSEStream.ts
import { useState, useEffect, useRef } from 'react';

interface StreamMessage {
  content: string;
  done: boolean;
  error?: string;
}

interface UseSSEStreamOptions {
  url: string;
  onMessage?: (message: StreamMessage) => void;
  onError?: (error: Event) => void;
  onComplete?: () => void;
}

export const useSSEStream = (options: UseSSEStreamOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [fullContent, setFullContent] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = (prompt: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsStreaming(true);
    setMessages([]);
    setFullContent('');

    const url = `${options.url}?prompt=${encodeURIComponent(prompt)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamMessage = JSON.parse(event.data);

        if (data.error) {
          console.error('流式响应错误:', data.error);
          return;
        }

        if (data.content) {
          setMessages((prev) => [...prev, data.content]);
          setFullContent((prev) => prev + data.content);
        }

        if (data.done) {
          setIsStreaming(false);
          eventSource.close();
          options.onComplete?.();
        }

        options.onMessage?.(data);
      } catch (error) {
        console.error('解析 SSE 数据失败:', error);
      }
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      setIsStreaming(false);
      options.onError?.(event);
    };
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return {
    isConnected,
    isStreaming,
    messages,
    fullContent,
    startStream,
    stopStream,
  };
};
```

### 3.2 AI 对话组件

```tsx
// AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSSEStream } from './useSSEStream';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AIChat: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isStreaming, fullContent, startStream, stopStream } = useSSEStream({
    url: '/api/ai-chat-stream',
    onMessage: (message) => {
      setCurrentAssistantMessage((prev) => prev + message.content);
    },
    onComplete: () => {
      // 流式输出完成，添加到对话历史
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
      };
      setConversation((prev) => [...prev, assistantMessage]);
      setCurrentAssistantMessage('');
    },
    onError: (error) => {
      console.error('流式连接错误:', error);
      setCurrentAssistantMessage('');
    },
  });

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setInput('');

    // 开始流式响应
    startStream(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, currentAssistantMessage]);

  return (
    <div className="ai-chat">
      <div className="messages-container">
        {conversation.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}

        {/* 当前正在输出的AI消息 */}
        {isStreaming && (
          <div className="message assistant streaming">
            <div className="message-content">
              {currentAssistantMessage}
              <span className="cursor">|</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题..."
          disabled={isStreaming}
          rows={3}
        />
        <button onClick={isStreaming ? stopStream : sendMessage} disabled={!input.trim() && !isStreaming}>
          {isStreaming ? '停止' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
```

### 3.3 样式定义

```css
/* AIChat.css */
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.message.user .message-content {
  background-color: #007bff;
  color: white;
}

.message.assistant .message-content {
  background-color: white;
  color: #333;
  border: 1px solid #e1e5e9;
}

.message.streaming .message-content {
  border-color: #007bff;
  position: relative;
}

.cursor {
  animation: blink 1s infinite;
  color: #007bff;
  font-weight: bold;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.message-time {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  padding: 0 8px;
}

.input-container {
  display: flex;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #e1e5e9;
  gap: 12px;
}

.input-container textarea {
  flex: 1;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.input-container textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-container button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  min-width: 80px;
}

.input-container button:hover {
  background-color: #0056b3;
}

.input-container button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
```

## 4. 高级功能实现

### 4.1 错误处理和重连机制

```typescript
// SSEWithRetry.ts
class SSEWithRetry {
  private eventSource: EventSource | null = null;
  private retryCount = 0;
  private maxRetries = 5;
  private retryDelay = 1000;
  private url: string;
  private isManualClose = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    this.isManualClose = false;
    this.createConnection(onMessage, onError);
  }

  private createConnection(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log('SSE 连接成功');
        this.retryCount = 0; // 重置重试计数
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('解析 SSE 数据失败:', error);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('SSE 连接错误:', event);
        onError?.(event);

        if (!this.isManualClose && this.retryCount < this.maxRetries) {
          this.retry(onMessage, onError);
        }
      };
    } catch (error) {
      console.error('创建 SSE 连接失败:', error);
      if (!this.isManualClose && this.retryCount < this.maxRetries) {
        this.retry(onMessage, onError);
      }
    }
  }

  private retry(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // 指数退避

    console.log(`SSE 重连中... (${this.retryCount}/${this.maxRetries}), ${delay}ms 后重试`);

    setTimeout(() => {
      if (!this.isManualClose) {
        this.createConnection(onMessage, onError);
      }
    }, delay);
  }

  close() {
    this.isManualClose = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }
}
```

### 4.2 多事件类型处理

```typescript
// 处理不同类型的 SSE 事件
interface SSEEvents {
  'ai-response': { content: string; done: boolean };
  'ai-thinking': { status: string };
  'ai-error': { error: string; code: number };
  'system-message': { message: string; type: 'info' | 'warning' | 'error' };
}

class TypedSSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(private url: string) {}

  connect() {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log('SSE 连接已建立');
    };

    // 处理默认消息
    this.eventSource.onmessage = (event) => {
      this.handleEvent('message', event.data);
    };

    // 处理自定义事件
    Object.keys(this.getEventTypes()).forEach((eventType) => {
      this.eventSource!.addEventListener(eventType, (event: any) => {
        this.handleEvent(eventType, event.data);
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE 错误:', error);
    };
  }

  private handleEvent(eventType: string, data: string) {
    try {
      const parsedData = JSON.parse(data);
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.forEach((callback) => callback(parsedData));
      }
    } catch (error) {
      console.error(`解析事件 ${eventType} 数据失败:`, error);
    }
  }

  on<K extends keyof SSEEvents>(event: K, callback: (data: SSEEvents[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof SSEEvents>(event: K, callback: (data: SSEEvents[K]) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }

  private getEventTypes(): SSEEvents {
    return {} as SSEEvents;
  }
}

// 使用示例
const sseClient = new TypedSSEClient('/api/ai-stream');

sseClient.on('ai-response', (data) => {
  console.log('AI 响应:', data.content);
  if (data.done) {
    console.log('AI 响应完成');
  }
});

sseClient.on('ai-thinking', (data) => {
  console.log('AI 思考状态:', data.status);
});

sseClient.on('ai-error', (data) => {
  console.error('AI 错误:', data.error);
});

sseClient.connect();
```

### 4.3 性能优化

```typescript
// 消息缓冲和批量处理
class BufferedSSEHandler {
  private buffer: string[] = [];
  private bufferSize = 10;
  private flushInterval = 100; // ms
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(private onFlush: (messages: string[]) => void, bufferSize = 10, flushInterval = 100) {
    this.bufferSize = bufferSize;
    this.flushInterval = flushInterval;
  }

  addMessage(message: string) {
    this.buffer.push(message);

    // 缓冲区满时立即刷新
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    } else {
      // 设置定时刷新
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  private flush() {
    if (this.buffer.length > 0) {
      this.onFlush([...this.buffer]);
      this.buffer = [];
    }

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  destroy() {
    this.flush(); // 确保所有消息都被处理
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }
}

// 使用示例
const bufferedHandler = new BufferedSSEHandler(
  (messages) => {
    console.log('批量处理消息:', messages);
    // 更新 UI
  },
  5, // 缓冲区大小
  50 // 刷新间隔 ms
);
```

## 5. 实际应用场景

### 5.1 文档生成助手

```tsx
// DocumentGenerator.tsx
import React, { useState } from 'react';
import { useSSEStream } from './useSSEStream';

interface DocumentSection {
  title: string;
  content: string;
  completed: boolean;
}

const DocumentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');

  const { isStreaming, startStream, stopStream } = useSSEStream({
    url: '/api/generate-document',
    onMessage: (message) => {
      if (message.content) {
        setCurrentSection((prev) => prev + message.content);
      }
    },
    onComplete: () => {
      // 完成当前章节
      setSections((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].content = currentSection;
          updated[updated.length - 1].completed = true;
        }
        return updated;
      });
      setCurrentSection('');
    },
  });

  const generateDocument = () => {
    if (!prompt.trim()) return;

    // 预设文档结构
    const documentStructure = [
      { title: '概述', content: '', completed: false },
      { title: '技术方案', content: '', completed: false },
      { title: '实施计划', content: '', completed: false },
      { title: '风险评估', content: '', completed: false },
    ];

    setSections(documentStructure);
    setCurrentSection('');
    startStream(prompt);
  };

  return (
    <div className="document-generator">
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述您想要生成的文档内容..."
          rows={4}
        />
        <button onClick={isStreaming ? stopStream : generateDocument} disabled={!prompt.trim() && !isStreaming}>
          {isStreaming ? '停止生成' : '生成文档'}
        </button>
      </div>

      <div className="document-preview">
        {sections.map((section, index) => (
          <div key={index} className="document-section">
            <h3 className={section.completed ? 'completed' : 'pending'}>
              {section.title}
              {section.completed && <span className="checkmark">✓</span>}
            </h3>
            <div className="section-content">
              {section.content}
              {index === sections.length - 1 && !section.completed && (
                <span className="current-content">
                  {currentSection}
                  <span className="cursor">|</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5.2 代码生成器

```tsx
// CodeGenerator.tsx
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useSSEStream } from './useSSEStream';

interface CodeBlock {
  language: string;
  code: string;
  explanation: string;
}

const CodeGenerator: React.FC = () => {
  const [requirement, setRequirement] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');

  const { isStreaming, startStream, stopStream } = useSSEStream({
    url: '/api/generate-code',
    onMessage: (message) => {
      if (message.content) {
        setGeneratedCode((prev) => prev + message.content);
      }
    },
    onComplete: () => {
      console.log('代码生成完成');
    },
  });

  const generateCode = () => {
    if (!requirement.trim()) return;

    setGeneratedCode('');
    const prompt = `请用${language}语言实现：${requirement}`;
    startStream(prompt);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // 显示复制成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="code-generator">
      <div className="controls">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="描述您需要的代码功能..."
          rows={3}
        />

        <button onClick={isStreaming ? stopStream : generateCode} disabled={!requirement.trim() && !isStreaming}>
          {isStreaming ? '停止生成' : '生成代码'}
        </button>
      </div>

      <div className="code-output">
        <div className="code-header">
          <span>生成的代码</span>
          {generatedCode && (
            <button onClick={copyToClipboard} className="copy-btn">
              复制代码
            </button>
          )}
        </div>

        <div className="code-container">
          {isStreaming || generatedCode ? (
            <SyntaxHighlighter language={language} showLineNumbers wrapLines>
              {generatedCode + (isStreaming ? '|' : '')}
            </SyntaxHighlighter>
          ) : (
            <div className="placeholder">在此显示生成的代码...</div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 6. 最佳实践

### 6.1 错误处理策略

```typescript
// 完整的错误处理机制
class RobustSSEClient {
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_RETRY_DELAY = 1000;

  private eventSource: EventSource | null = null;
  private retryCount = 0;
  private isDestroyed = false;

  constructor(
    private url: string,
    private options: {
      onMessage: (data: any) => void;
      onError?: (error: string) => void;
      onConnectionChange?: (connected: boolean) => void;
    }
  ) {}

  connect() {
    if (this.isDestroyed) return;

    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        this.retryCount = 0;
        this.options.onConnectionChange?.(true);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.options.onMessage(data);
        } catch (error) {
          this.handleError('数据解析失败');
        }
      };

      this.eventSource.onerror = () => {
        this.options.onConnectionChange?.(false);
        this.handleConnectionError();
      };
    } catch (error) {
      this.handleError('连接创建失败');
    }
  }

  private handleConnectionError() {
    if (this.isDestroyed) return;

    if (this.retryCount < RobustSSEClient.MAX_RETRIES) {
      const delay = RobustSSEClient.INITIAL_RETRY_DELAY * Math.pow(2, this.retryCount);
      this.retryCount++;

      setTimeout(() => {
        if (!this.isDestroyed) {
          this.connect();
        }
      }, delay);
    } else {
      this.handleError('连接失败，已达到最大重试次数');
    }
  }

  private handleError(message: string) {
    console.error('SSE 错误:', message);
    this.options.onError?.(message);
  }

  disconnect() {
    this.isDestroyed = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.options.onConnectionChange?.(false);
  }
}
```

### 6.2 性能监控

```typescript
// SSE 性能监控
class SSEPerformanceMonitor {
  private startTime: number = 0;
  private messageCount: number = 0;
  private totalBytes: number = 0;
  private metrics: {
    averageLatency: number;
    messagesPerSecond: number;
    bytesPerSecond: number;
  } = {
    averageLatency: 0,
    messagesPerSecond: 0,
    bytesPerSecond: 0,
  };

  startMonitoring() {
    this.startTime = Date.now();
    this.messageCount = 0;
    this.totalBytes = 0;
  }

  recordMessage(data: string) {
    this.messageCount++;
    this.totalBytes += new Blob([data]).size;
    this.updateMetrics();
  }

  private updateMetrics() {
    const elapsed = (Date.now() - this.startTime) / 1000;

    if (elapsed > 0) {
      this.metrics.messagesPerSecond = this.messageCount / elapsed;
      this.metrics.bytesPerSecond = this.totalBytes / elapsed;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.startMonitoring();
  }
}
```

### 6.3 内存优化

```typescript
// 大量数据的内存优化
class MemoryOptimizedStream {
  private maxBufferSize = 1000; // 最大缓存消息数
  private messages: string[] = [];
  private onBufferOverflow?: (removedMessages: string[]) => void;

  constructor(options?: { maxBufferSize?: number; onBufferOverflow?: (removedMessages: string[]) => void }) {
    if (options?.maxBufferSize) {
      this.maxBufferSize = options.maxBufferSize;
    }
    this.onBufferOverflow = options?.onBufferOverflow;
  }

  addMessage(message: string) {
    this.messages.push(message);

    if (this.messages.length > this.maxBufferSize) {
      const removedMessages = this.messages.splice(0, this.messages.length - this.maxBufferSize);
      this.onBufferOverflow?.(removedMessages);
    }
  }

  getMessages() {
    return [...this.messages];
  }

  clear() {
    this.messages = [];
  }

  getMemoryUsage() {
    const totalChars = this.messages.reduce((sum, msg) => sum + msg.length, 0);
    return {
      messageCount: this.messages.length,
      estimatedBytes: totalChars * 2, // Unicode 字符大约 2 字节
      maxBufferSize: this.maxBufferSize,
    };
  }
}
```

## 7. 调试和监控

### 7.1 开发工具

```typescript
// SSE 调试工具
class SSEDebugger {
  private logs: Array<{
    timestamp: number;
    type: 'connect' | 'message' | 'error' | 'close';
    data?: any;
  }> = [];

  private enabled = process.env.NODE_ENV === 'development';

  log(type: 'connect' | 'message' | 'error' | 'close', data?: any) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: Date.now(),
      type,
      data
    };

    this.logs.push(logEntry);
    console.group(`[SSE ${type.toUpperCase()}] ${new Date().toLocaleTimeString()}`);
    console.log('Data:', data);
    console.log('Connection State:', this.getConnectionState());
    console.groupEnd();
  }

  private getConnectionState() {
    // 获取连接状态信息
    return {
      totalLogs: this.logs.length,
      lastMessage: this.logs[this.logs.length - 1]?.timestamp,
      errorCount: this.logs.filter(log => log.type === 'error').length
    };
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }
}

// 使用示例
const debugger = new SSEDebugger();

const eventSource = new EventSource('/api/stream');
eventSource.onopen = () => debugger.log('connect');
eventSource.onmessage = (event) => debugger.log('message', event.data);
eventSource.onerror = (error) => debugger.log('error', error);
```

### 7.2 生产环境监控

```typescript
// 生产环境监控
class SSEMonitoring {
  private static instance: SSEMonitoring;

  private metrics = {
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    messagesReceived: 0,
    averageLatency: 0,
    errors: [] as Array<{ timestamp: number; error: string }>,
  };

  static getInstance() {
    if (!SSEMonitoring.instance) {
      SSEMonitoring.instance = new SSEMonitoring();
    }
    return SSEMonitoring.instance;
  }

  recordConnectionAttempt() {
    this.metrics.connectionAttempts++;
  }

  recordSuccessfulConnection() {
    this.metrics.successfulConnections++;
  }

  recordFailedConnection() {
    this.metrics.failedConnections++;
  }

  recordMessage() {
    this.metrics.messagesReceived++;
  }

  recordError(error: string) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error,
    });

    // 只保留最近的100个错误
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      connectionSuccessRate:
        this.metrics.connectionAttempts > 0
          ? (this.metrics.successfulConnections / this.metrics.connectionAttempts) * 100
          : 0,
      recentErrors: this.metrics.errors.slice(-10),
    };
  }

  // 定期上报监控数据
  startReporting(interval = 60000) {
    // 默认每分钟上报一次
    setInterval(() => {
      const metrics = this.getMetrics();

      // 上报到监控服务
      fetch('/api/monitoring/sse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch((error) => {
        console.error('监控数据上报失败:', error);
      });
    }, interval);
  }
}
```

## 8. 总结

### 8.1 技术要点总结

1. **SSE 基础**

   - 基于 HTTP 协议的单向通信
   - 自动重连机制
   - 事件驱动架构

2. **实现关键点**

   - 正确设置响应头
   - 错误处理和重连策略
   - 内存管理和性能优化

3. **最佳实践**
   - 合理的缓冲策略
   - 完善的错误处理
   - 生产环境监控

### 8.2 适用场景

- ✅ AI 对话和流式输出
- ✅ 实时通知推送
- ✅ 进度更新和状态同步
- ✅ 日志流式输出
- ❌ 需要双向通信的场景
- ❌ 对延迟要求极高的场景

### 8.3 注意事项

1. **浏览器限制**: 每个域名的 SSE 连接数有限制
2. **网络环境**: 某些代理服务器可能不支持长连接
3. **内存管理**: 长时间运行需要注意内存泄漏
4. **错误恢复**: 实现 robust 的重连和错误处理机制

通过本教程，您可以完整掌握使用 SSE 实现 AI 流式输出的技术方案，并在实际项目中应用这些最佳实践。
