---
title: 004 使用Fabric.js操作canvas
theme: solarized-dark
---

# 使用 Fabric.js 操作 canvas

[Fabric.js](https://fabricjs.com/) 是一个流行的 JavaScript HTML5 canvas 库，它使得在 JavaScript 中处理和操作图形变得更加简单。这个库提供了一组丰富的 API，可以帮助你方便地创建、操作和修改 HTML5 canvas 上的图形对象。

### 一、安装和设置

首先，确保你已经安装了 Node.js 和 npm。然后，你可以使用 npm 来安装 Fabric.js：

```shell
npm install fabric --save
```

还可以使用 cdn 的方式引入 Fabric.js：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
```

### 二、为什么使用 Fabric.js

因为它提供了许多强大的功能和优点，推荐使用它有以下几个原因：

- **全面的功能**： Fabric.js 提供了丰富的图形元素和工具，如矩形、椭圆、多边形、线条、文本等，并允许你在画布上灵活地操作它们。此外，它还支持各种变换和组合模式，如旋转、缩放、倾斜、编组等。
- 性能优化： Fabric.js 在处理大量对象或复杂图形时，能够提供良好的性能。它使用了一个高效的渲染引擎，能够智能地管理渲染缓存，并在需要时进行优化。
- **灵活性和可扩展性**： Fabric.js 的设计非常灵活，可以通过继承和扩展现有的对象类来轻松地添加新的功能。此外，它还提供了各种事件（例如点击、触摸、双指缩放等），以方便与用户交互。
- **社区支持**： Fabric.js 有一个活跃的社区，提供了大量的教程、示例和插件。这意味着当你遇到问题时，你很容易找到帮助和解决方案。
- **兼容性**： Fabric.js 在各种浏览器上表现良好，包括现代移动设备。这意味着你可以在各种设备上使用 Fabric.js 来创建丰富的交互体验。
- **易于使用**： Fabric.js 的 API 清晰明了，易于学习和使用。即使是没有编程经验的人，也能快速上手并开始创建自己的项目。

以上这些优点使得 Fabric.js 成为一种强大且全面的 JavaScript 图形库，无论你是创建复杂的游戏、数据可视化应用还是简单的交互式网页元素，Fabric.js 都值得考虑。

### 三、Fabric.js 对比原生 canvas

Fabric.js 和原生 canvas 都是用于创建和操作图形的强大工具，但它们在某些方面有所不同。以下是使用这两种库创建矩形的基本示例。

**使用 Fabric.js 创建矩形**：

```js
// 引入 Fabric 库
import fabric from 'fabric';
const canvas = new fabric.Canvas('c');
// 创建矩形对象
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 200,
  height: 200,
});
// 将矩形添加到画布上
canvas.add(rect);
```

**使用原生 canvas 创建矩形：**

```js
// 获取页面中的canvas元素
const cnv = document.getElementById('c');
const ctx = cnv.getContext('2d');
ctx.moveTo(50, 50);
ctx.lineTo(200, 50);
ctx.lineTo(200, 120);
ctx.lineTo(50, 120);
ctx.lineTo(50, 50);
ctx.fillStyle = 'red';
ctx.fill();
```

> [!NOTE]
>
> 这两段代码都会在 HTML 页面中创建一个红色的矩形，但是使用 Fabric.js 可以创建更复杂的图形，并且可以方便地操作它们的属性（例如颜色，位置，大小等）。此外，Fabric.js 还提供了更高级的功能，如事件处理、图层管理、滤镜等。而原生 canvas 在某些情况下可能具有更高的性能。

> [!NOTE]
>
> 你可以根据需要选择更适合你的项目的库。如果你需要处理复杂的图形或者需要方便地操作图形的属性，那么 Fabric.js 可能更适合你。如果你只需要在画布上绘制简单的形状，并且追求更高的性能，那么原生 canvas 可能更适合你。

### 四、基本概念

1. **画布（Canvas）**

在 Fabric.js 中，画布是一个非常重要的元素。你可以将它看作是绘画的“画布”，可以在上面绘制各种形状、图像和文本。Fabric.js 也提供了丰富的交互和动画功能。

2. **对象（Object）**

Fabric.js 提供了许多内置对象，如矩形、椭圆、线条、文本等，这些对象都有一些通用属性，如 left、top、width、height 等。同时，Fabric.js 也允许你创建自定义对象。

3. 属性（Properties）

对象的属性定义了该对象的特点，比如颜色、大小、位置等。在 Fabric.js 中，你可以直接设置或修改对象的属性。

4. **事件（Events）**

Fabric.js 提供了丰富的事件模型，包括 mouse events，touch events，object events 等。你可以很容易地添加事件监听器到 Fabric.js 对象上，当特定事件发生时，你的回调函数会被调用。

5. **变换（Transformations）**

Fabric.js 提供了各种变换方法，如旋转（rotate()）、缩放（scale()）、倾斜（skewX() 和 skewY()）等。这些方法可以用来改变对象的位置、大小和形状。

6. **组合（Composition）**

在 Fabric.js 中，你可以创建复杂的图形组合。一个组合可以包含多个对象，这些对象会作为一个整体进行变换。

7. **图层（Layers）**

在 Fabric.js 中，你可以创建多个画布，并在这些画布上添加对象。这样，你可以轻松地管理复杂的图形层次结构，每个层次可以包含多个对象。

8. **SVG 支持**

Fabric.js 还支持从 SVG 文件创建对象。这意味着你可以很容易地从 SVG 文件导入图形，然后在 Fabric.js 画布上进行操作。

### 五、创建画布

本文介绍的是在 React 中使用 Fabric.js 创建画布，你可以按照以下步骤进行操作：

1. 首先，确保已经安装了 Fabric.js 和 React。你可以使用 npm 或 yarn 来安装它们。
2. 创建一个 React 组件，用于包含 Fabric 画布。例如，创建一个名为 Canvas.js 的文件，并导入 Fabric 和 React。
3. 在组件中创建一个 ref 来引用 Fabric 画布的 DOM 元素。可以使用 useRef 钩子来创建该引用。
4. 在组件的 render 函数中，渲染一个`<canvas>`元素，并将 ref 附加到它上面。确保导入 Fabric 的所需对象和函数。
5. 在组件中创建一个 useEffect 钩子来初始化 Fabric 画布，并将其关联到 React 组件的生命周期。在 useEffect 中，使用 fabric.Canvas 创建一个新的画布实例，并将其附加到 ref 引用的 DOM 元素上：

```js
function Canvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      fireRightClick: true, // 启用右键，button的数字为3
      stopContextMenu: true, // 禁止默认右键菜单
      controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
      preserveObjectStacking: true,
    });
    // 在这里可以添加自定义的画布设置和操作...
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
}
```

### 六、创建对象

Fabric.js 提供了多种对象供我们使用，包括矩形、圆形、线、文本等。下面我们分别介绍一下这些对象的创建方法。

**1、矩形**

```js
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 200,
  height: 200,
});
canvas.add(rect);
```

**2、圆形**

```js
const circle = new fabric.Circle({
  left: 100,
  top: 100,
  fill: 'blue',
  radius: 100,
});
canvas.add(circle);
```

**3、线**

```js
const line = new fabric.Line([100, 100, 300, 300], {
  stroke: 'green',
  strokeWidth: 4,
});
canvas.add(line);
```

**4、文本**

```js
const text = new fabric.Text('今晚吃鸡，大吉大利', {
  left: 100,
  top: 100,
  fill: 'black',
  fontSize: 30,
});
canvas.add(text);
```

**5、图片**

```js
fabric.Image.fromURL(
  'https://osstest.jrdaimao.com/ac/1692347493428_300x300.jpg',
  (img) => {
    img.set({
      width: 300,
      height: 300,
      left: 100,
      top: 100,
      scaleX: 0.5,
      scaleY: 0.5,
    });
    canvas.add(img);
  },
  { crossOrigin: 'anonymous' }
);
```

### 七、设置对象的属性

Fabric.js 允许你通过其对象模型来设置和修改对象的属性。

以下是关于 Rect、Text 和 Image 对象的属性介绍：

**1、Rect 对象属性**

- left：矩形左边界相对于 canvas 左边框的位置。
- top：矩形上边界相对于 canvas 上边框的位置。
- fill：矩形的填充颜色。
- stroke：矩形的描边颜色。
- strokeWidth：矩形的描边宽度。
- strokeDashArray：矩形的描边样式，例如虚线。
- width：矩形的宽度。
- height：矩形的高度。
- angle：矩形的旋转角度（以度为单位）。
- opacity：矩形的透明度（0-1）。
- flipX 和 flipY：矩形的翻转标志。

**2、Text 对象属性**

- left：文本左边界相对于 canvas 左边框的位置。
- top：文本上边界相对于 canvas 上边框的位置。
- fill：文本的颜色。
- stroke：文本描边的颜色。
- strokeWidth：文本描边的宽度。
- strokeDashArray：文本描边的样式，例如虚线。
- fontFamily：文本的字体。
- fontSize：文本的大小（像素）。
- fontWeight：文本的粗细，如 ‘normal’, ‘bold’, ‘bolder’, ‘lighter’, 或者数字（0-1000）。
- fontStyle：文本的样式，如 ‘normal’, ‘italic’, ‘oblique’。
- lineHeight：文本的行高（比率或像素值）。
- textDecoration：文本的装饰样式，如 ‘none’, ‘underline’, ‘overline’, ‘line-through’ 或者 ‘blink’。
- textAlign：文本的水平对齐方式，如 ‘left’, ‘center’, ‘right’。
- textBaseline：文本的垂直对齐方式，如 ‘top’, ‘middle’, ‘bottom’。

**3、Image 对象属性**

- left：图片左边界相对于 canvas 左边框的位置。
- top：图片上边界相对于 canvas 上边框的位置。
- src：图片的源 URL。
- width 和 height：图片的宽度和高度（如果未指定，则将根据其自然大小缩放）。
- scaleX 和 scaleY：图片的水平方向和垂直方向的缩放比例（相对于其自然大小）。
- opacity：图片的透明度（0-1）。
- angle：图片的旋转角度（以度为单位）。
- flipX 和 flipY：图片的翻转标志。

以下是一些基本示例：

```js
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 100,
  height: 100,
});
canvas.add(rect);
canvas.renderAll();

// 使用 set() 方法设置对象的属性，将矩形的 left 属性设置为 300，fill 属性设置为 'green'
rect.set({
  left: 300,
  fill: 'green',
});

// 你也可以使用 set() 方法同时设置多个属性
// 将矩形的 left、top、fill、width 和 height 属性进行设置
rect.set({
  left: 400,
  top: 400,
  fill: 'yellow',
  width: 50,
  height: 50,
});

// 设置属性后重新更新视图
canvas.renderAll();
```

### 八、一些常用的事件

Fabric.js 提供了丰富的事件处理机制，包括鼠标点击、鼠标移动、鼠标释放等。下面我们分别介绍一下这些事件的处理方式。

**1、鼠标移动事件**

```js
canvas.on('mouse:move', function (opt) {
  console.log(`x ${opt.pointer.x} | y ${opt.pointer.y}`);
});
```

**2、鼠标按下和鼠标抬起事件**

```js
canvas.on('mouse:down', function () {
  console.log('鼠标按下');
});
canvas.on('mouse:up', function () {
  console.log('鼠标抬起');
});
```

**3、鼠标滚轮事件**

```js
canvas.on('mouse:wheel', function(this, opt){
    const zoom = this.getZoom();
    console.log('当前画布缩放比例', zoom);
})
```

**4、对象更新后的事件**

```js
canvas.on('after:render', function (options) {
  console.log('update');
});
```

**5、一次绑定多个事件**

```js
function selected() {
  console.log('selected');
}
// 绑定多个事件
canvas.on({
  'selection:created': selected,
  'selection:updated': selected,
  'selection:cleared': selected,
  'mouse:wheel': onWheel,
});
// 解绑多个事件
canvas.off({
  'selection:created': selected,
  'selection:updated': selected,
  'selection:cleared': selected,
  'mouse:wheel': onWheel,
});
```

### 九、变换

Fabric.js 提供了多种变换操作，包括平移（Translation）、缩放（Scaling）、旋转（Rotation）和倾斜（Shearing）等。具体来说，平移操作可以使用 translate 方法来实现，缩放操作可以使用 scale 方法，旋转操作可以使用 rotate 方法，倾斜操作可以使用 skewX 和 skewY 方法。这些方法都接受一个角度参数，用于指定变换的角度。同时，还可以使用 setCenter 方法来改变图形中心点的位置。此外，还可以通过修改图形的 left、top、width 和 height 属性来直接改变图形的位置和大小。除了这些基本的变换操作，Fabric.js 还提供了更高级的变换方式，例如通过设置变换矩阵来实现复杂的变换操作。可以使用 setTransformMatrix 方法来设置自定义的变换矩阵，该方法接受一个包含六个元素的数组作为参数，这些元素定义了变换矩阵的各个元素。

以下是一些 Fabric.js 中 rect、text 和 image 的变换方法:

1.**对于 rect 和 image**

- scale(scaleX, scaleY): 对矩形进行缩放
- rotate(angle): 对矩形进行旋转
- translate(x, y): 对矩形进行平移
- set({ left: value, top: value }): 设置矩形的位置

```js
const rect = new fabric.Rect({ width: 100, height: 100 });

rect.scale(2, 2); // 将矩形放大两倍

rect.rotate(45, 'center'); // 将矩形顺时针旋转45度，旋转的中心点是矩形的中心

rect.translate(50, 50); // 将矩形向右移动50px，向下移动50px

rect.set({ left: 50, top: 50 }); // 将矩形向右移动50px，向下移动50px
```

**2.对于 text**

- setFontSize(value): 设置文本的字体大小
- setFontFamily(value): 设置文本的字体类型
- setFill(value): 设置文本的颜色
- setStroke(value): 设置文本的描边颜色
- setStrokeWidth(value): 设置文本的描边宽度
- setTransform(value): 设置文本的变换，如旋转、缩放等

```js
const text = new fabric.Text('Hello World');

text.setFontSize(88); // 将文字的字体大小设置成88px

text.setFontFamily('serif'); // 将文字的字体类型设置成serif

text.setFill('#888888'); // 将文字的字体颜色设置成#888888

text.setStroke('red'); // 将文本的描边颜色设置为红色

text.setStrokeWidth(2); // 将文本的描边宽度设置为2px
```
