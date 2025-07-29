---
title: MySql常见命令
theme: solarized-dark
---

**启动 mysql**

```sql
sudo /usr/local/mysql/support-files/mysql.server start
```

**进入 MySQL 命令行**

```sql
mysql -u root -p
```

- `-u root` 表示使用 root 用户登录（也可以换成其他用户名）
- `-p` 表示需要输入密码（执行后会提示输入密码）

以下是 **MySQL 常用命令大全**，涵盖 **数据库操作、表管理、数据增删改查、用户权限** 等，适合快速查阅和日常使用。

---

## **1. 数据库操作**

| 命令                             | 说明               |
| -------------------------------- | ------------------ |
| `SHOW DATABASES;`                | 查看所有数据库     |
| `CREATE DATABASE 数据库名;`      | 创建数据库         |
| `USE 数据库名;`                  | 切换数据库         |
| `DROP DATABASE 数据库名;`        | 删除数据库         |
| `SHOW CREATE DATABASE 数据库名;` | 查看数据库创建语句 |

**示例**：

```sql
CREATE DATABASE test_db;
USE test_db;
SHOW DATABASES;
```

---

## **2. 表操作**

### **(1) 创建表**

```sql
CREATE TABLE 表名 (
    列1 数据类型 [约束],
    列2 数据类型 [约束],
    ...
);
```

**示例**：

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    email VARCHAR(100) UNIQUE
);
```

### **(2) 查看表**

| 命令                      | 说明                   |
| ------------------------- | ---------------------- |
| `SHOW TABLES;`            | 查看当前数据库的所有表 |
| `DESC 表名;`              | 查看表结构             |
| `SHOW CREATE TABLE 表名;` | 查看建表语句           |

**示例**：

```sql
SHOW TABLES;
DESC users;
```

### **(3) 修改表**

| 命令                                              | 说明           |
| ------------------------------------------------- | -------------- |
| `ALTER TABLE 表名 ADD 列名 数据类型;`             | 添加列         |
| `ALTER TABLE 表名 DROP COLUMN 列名;`              | 删除列         |
| `ALTER TABLE 表名 MODIFY COLUMN 列名 新数据类型;` | 修改列数据类型 |
| `ALTER TABLE 表名 RENAME TO 新表名;`              | 重命名表       |

**示例**：

```sql
ALTER TABLE users ADD phone VARCHAR(20);
ALTER TABLE users DROP COLUMN age;
```

### **(4) 删除表**

```sql
DROP TABLE 表名;
```

---

## **3. 数据增删改查（CRUD）**

### **(1) 插入数据**

```sql
INSERT INTO 表名 (列1, 列2, ...) VALUES (值1, 值2, ...);
```

**示例**：

```sql
INSERT INTO users (name, email) VALUES ('张三', 'zhangsan@example.com');
```

### **(2) 查询数据**

| 命令                                                  | 说明                    |
| :---------------------------------------------------- | ----------------------- | ---- |
| `SELECT * FROM 表名;`                                 | 查询所有数据            |
| `SELECT 列1, 列2 FROM 表名;`                          | 查询指定列              |
| `SELECT * FROM 表名 WHERE 条件;`                      | 条件查询                |
| `SELECT \* FROM 表名 ORDER BY 列名 [ASC               | DESC];`                 | 排序 |
| `SELECT * FROM 表名 LIMIT 数量;`                      | 限制返回条数            |
| `SELECT FROM 表名 WHERE name = '张三' AND age <= 20;` | 多个条件联合查询（and） |
| `SELECT FROM 表名 WHERE name = '张三'or age <= 20;`   | 多个条件联合查询（or）  |
| `SELECT * FROM 表名 WHERE name LIKE '%张%'`           | 模糊查询                |

- "张%"：匹配以"张"开头的字符串，后面可以是任意字符。
- "%张"：匹配以"张"结尾的字符串，前面可以是任意字符。
- "%张%"：匹配包含"张"的任意位置的字符串，前后可以是任意字符。

**示例**：

```sql
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 18;
SELECT * FROM users ORDER BY id DESC LIMIT 10;
```

[查询大全](https://blog.csdn.net/qq_57570052/article/details/132171270)

### **(3) 更新数据**

```sql
UPDATE 表名 SET 列1=值1, 列2=值2 WHERE 条件;
```

**示例**：

```sql
UPDATE users SET name='李四' WHERE id=1;
```

### **(4) 删除数据**

```sql
DELETE FROM 表名 WHERE 条件;
```

**批量删除**

```sql
DELETE FROM `user` WHERE id IN (8,9,10);
```

**示例**：

```sql
DELETE FROM users WHERE id=1;
```

---

## **4. 用户与权限管理**

### **(1) 创建用户**

```sql
CREATE USER '用户名'@'主机' IDENTIFIED BY '密码';
```

**示例**：

```sql
CREATE USER 'test_user'@'localhost' IDENTIFIED BY '123456';
```

### **(2) 授权**

```sql
GRANT 权限 ON 数据库.表 TO '用户名'@'主机';
```

**示例**：

```sql
GRANT ALL PRIVILEGES ON test_db.* TO 'test_user'@'localhost';
FLUSH PRIVILEGES;  -- 刷新权限
```

### **(3) 撤销权限**

```sql
REVOKE 权限 ON 数据库.表 FROM '用户名'@'主机';
```

**示例**：

```sql
REVOKE ALL PRIVILEGES ON test_db.* FROM 'test_user'@'localhost';
```

### **(4) 删除用户**

```sql
DROP USER '用户名'@'主机';
```

---

## **5. 其他实用命令**

| 命令                | 说明                |
| ------------------- | ------------------- |
| `SHOW PROCESSLIST;` | 查看当前连接会话    |
| `KILL 进程ID;`      | 终止某个 MySQL 连接 |
| `EXIT;` 或 `\q`     | 退出 MySQL 命令行   |
| `SOURCE 文件路径;`  | 执行 SQL 脚本文件   |

---

## 6.表达式和函数

以下是一份详细的 **MySQL 表达式与函数指南**，涵盖常用运算符、内置函数及复杂表达式用法：

### (1) **MySQL 表达式**

表达式是由字面量、列名、运算符和函数组成的代码片段，用于计算或生成值。

#### 1. **运算符**

**算术运算符**

```sql
+ 加法  - 减法  * 乘法  / 除法  % 取模  DIV 整除
```

```sql
SELECT 10 + 5;        -- 15
SELECT 7 % 3;         -- 1
SELECT 10 DIV 3;      -- 3
```

**比较运算符**

```sql
= 等于  <> 或 != 不等于  > 大于  < 小于  >= 大于等于  <= 小于等于
BETWEEN ... AND ...   IN(...)   IS NULL   IS NOT NULL
LIKE (模糊匹配)   REGEXP (正则匹配)
```

```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT name FROM products WHERE price IN (100, 200);
SELECT * FROM logs WHERE message LIKE '%error%';
```

**逻辑运算符**

```sql
AND   OR   NOT   XOR
```

```sql
SELECT * FROM orders WHERE status = 'paid' AND amount > 100;
```

**位运算符**

```sql
& 按位与  | 按位或  ^ 按位异或  << 左移  >> 右移  ~ 按位取反
```

```sql
SELECT 5 & 3;  -- 1 (二进制 0101 & 0011)
```

#### 2. **条件表达式**

**CASE 表达式**

```sql
SELECT
    name,
    CASE
        WHEN age < 18 THEN '未成年'
        WHEN age BETWEEN 18 AND 60 THEN '成年'
        ELSE '老年'
    END AS age_group
FROM users;
```

**IF 函数**

```sql
SELECT IF(score >= 60, '及格', '不及格') AS result FROM exams;
```

**COALESCE 处理 NULL**

```sql
SELECT COALESCE(address, '未知地址') FROM customers; -- 返回第一个非 NULL 值
```

**NULLIF 比较相等返回 NULL**

```sql
SELECT NULLIF(column1, column2); -- 若 column1 = column2，返回 NULL
```

---

### (2) .**MySQL 内置函数**

**1. 字符串函数**

```sql
-- 连接字符串
CONCAT(str1, str2, ...)
CONCAT_WS(分隔符, str1, str2, ...)  -- 带分隔符的连接

-- 示例
SELECT CONCAT('Hello', ' ', 'World');  -- Hello World
SELECT CONCAT_WS(', ', 'Apple', 'Banana'); -- Apple, Banana

-- 大小写转换
LOWER(str)  UPPER(str)

-- 截取与长度
SUBSTRING(str, start, length)  CHAR_LENGTH(str)  LENGTH(str)（字节长度）

-- 替换与去除空格
REPLACE(str, old, new)  TRIM([LEADING|TRAILING|BOTH] ' ' FROM str)

-- 格式化
FORMAT(number, decimal_places) -- 数字格式化
LPAD(str, length, pad_str)     -- 左填充
```

**2. 数值函数**

```sql
ROUND(number, decimals)  -- 四舍五入
CEIL(number)             -- 向上取整
FLOOR(number)            -- 向下取整
ABS(number)              -- 绝对值
MOD(dividend, divisor)   -- 取模
RAND()                   -- 生成0~1随机数
POW(base, exponent)      -- 幂运算
SQRT(number)             -- 平方根
```

**3. 日期与时间函数**

```sql
-- 当前时间
NOW()       -- 当前日期和时间（如 '2023-10-01 12:34:56'）
CURDATE()   -- 当前日期
CURTIME()   -- 当前时间

-- 提取部分日期
YEAR(date)  MONTH(date)  DAY(date)
HOUR(time)  MINUTE(time)  SECOND(time)

-- 日期计算
DATE_ADD(date, INTERVAL expr unit)  -- 增加时间间隔
DATE_SUB(date, INTERVAL expr unit)  -- 减少时间间隔
DATEDIFF(end_date, start_date)      -- 日期差（天数）

-- 格式化日期
DATE_FORMAT(date, format)
-- 示例：将日期格式化为 '2023年10月01日'
SELECT DATE_FORMAT(NOW(), '%Y年%m月%d日');
```

**4. 聚合函数**

```sql
COUNT(*)         -- 统计行数
SUM(column)      -- 求和
AVG(column)      -- 平均值
MAX(column)      -- 最大值
MIN(column)      -- 最小值
GROUP_CONCAT(column) -- 合并分组的值（默认逗号分隔）
```

**5. 高级函数**

**窗口函数（MySQL 8.0+）**

```sql
ROW_NUMBER() OVER (ORDER BY column) -- 行号
RANK() OVER (PARTITION BY ... ORDER BY ...) -- 排名
LEAD(column) OVER (...)            -- 访问后续行的值
```

**JSON 函数（MySQL 5.7+）**

```sql
JSON_EXTRACT(json_column, '$.key')  -- 提取 JSON 字段
JSON_SET(json_column, '$.key', value) -- 修改 JSON 字段
```

**加密函数**

```sql
MD5(str)          -- 计算 MD5 哈希值
SHA1(str)         -- 计算 SHA1 哈希值
AES_ENCRYPT(data, key) -- AES 加密
```

**6. 类型转换函数**

```sql
CAST(expr AS type)   -- 转换数据类型（如 CAST('123' AS SIGNED)）
CONVERT(expr, type)  -- 同上
```

---

### **(3) 表达式与函数使用示例**

**示例 1：复杂查询**

```sql
SELECT
    user_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    YEAR(register_date) AS register_year,
    AVG(order_amount) OVER (PARTITION BY user_id) AS avg_order
FROM users
WHERE
    DATEDIFF(NOW(), last_login) < 30
    AND COALESCE(email, '') != '';
```

**示例 2：动态计算**

```sql
SELECT
    product_id,
    price,
    IF(price > 100, price * 0.9, price) AS discounted_price,
    CASE
        WHEN stock <= 0 THEN '缺货'
        WHEN stock < 10 THEN '库存紧张'
        ELSE '充足'
    END AS stock_status
FROM products;
```

---

### (4) **注意事项**

1. **NULL 处理**：大多数函数遇到 NULL 会返回 NULL，需用 `IFNULL()` 或 `COALESCE()` 处理。

2. **性能影响**：复杂函数（如正则、窗口函数）可能影响查询速度，避免在大数据集滥用。

3. **版本兼容性**：部分函数（如窗口函数）仅限 MySQL 8.0+，需确认数据库版本。

4. **大小写敏感**：字符串函数默认大小写不敏感，可用 `BINARY` 强制区分：

   ```sql
   SELECT 'Apple' = 'apple';          -- 1 (不敏感)
   SELECT BINARY 'Apple' = 'apple';   -- 0 (敏感)
   ```

---

如果需要更具体的函数说明或实际场景的案例，请补充说明！

## **总结**

- **数据库操作**：`CREATE DATABASE`, `USE`, `DROP DATABASE`
- **表操作**：`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`
- **数据操作**：`INSERT`, `SELECT`, `UPDATE`, `DELETE`
- **用户权限**：`CREATE USER`, `GRANT`, `REVOKE`
