# quantized.uk “社区测速提交”功能：Cloudflare 设置教程（交给 AI 执行）

> 给执行者（AI）：你在网站主人的 Cloudflare 账户里操作。你不需要了解这个项目的代码，**只做下面列出的步骤，不做任何额外操作**。全部在 Cloudflare 网页控制台完成，不需要命令行，不需要创建 API Token。

## 背景（一句话）

网站 quantized.uk 部署在 Cloudflare Pages（项目名 `quantized`）。新功能让访客提交自己测到的模型速度，提交内容存进一个私有的 D1 数据库，等人工审核，不会自动公开。本教程只创建这个数据库，并设置一个防刷用的密钥。

## 费用说明（先读）

- 所有步骤都在 **Workers Free（免费）计划**内，**费用为 0**。
- 免费计划额度用完时，Cloudflare **只会暂停服务到第二天（UTC 0 点重置），不会扣费，也不会自动升级**。只有主人自己手动升级到 Workers Paid 才可能产生费用。
- 免费额度（Cloudflare 官方文档）：D1 每个账户最多 10 个数据库，本功能用 2 个；每个数据库最大 500 MB；每天 500 万行读取、10 万行写入。一次提交只写入一行。来源：[D1 价格](https://developers.cloudflare.com/d1/platform/pricing/)、[D1 限制](https://developers.cloudflare.com/d1/platform/limits/)。

## 禁止事项

- 不要升级到 Workers Paid 或任何付费计划，不要添加付款方式。
- 不要创建 API Token，不要授权任何第三方应用，不要在命令行运行 `wrangler login`。
- 不要修改 DNS、域名、其他 Pages/Workers 项目、构建设置或已有的变量。
- 不要在 Pages 项目的“绑定（Bindings）”里手动添加 D1 绑定。绑定会由我们写进代码仓库。
- 不要删除任何东西。
- 如果某一步出现要求付款、升级或页面和描述不一致的情况，**停下来，告诉主人**，不要自己想办法绕过。

## 第 0 步：确认是免费计划

1. 登录 Cloudflare 控制台，进入 **Workers & Pages**。
2. 找到 **Plans**（计划）或账户订阅信息，确认 Workers 是 **Free**。
3. 如果显示的是 Paid，**停下来告诉主人**（Paid 计划超额会计费）。

创建内容：无。费用：0。

## 第 1 步：创建正式环境数据库

1. 左侧菜单进入 **Storage & Databases → D1 SQL Database**（有的界面叫 **Workers & Pages → D1**）。
2. 点 **Create**（创建数据库）。
3. 名称填：`quantized-community-speed`
4. 位置（Location）保持默认（自动）。**不要打开读副本（read replication）等可选功能。**
5. 点创建。
6. 打开这个数据库，复制它的 **Database ID**（一串 UUID，形如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`），记下来。

创建内容：1 个空的 D1 数据库（占 10 个免费名额中的 1 个）。费用：0。

## 第 2 步：创建预览环境数据库

重复第 1 步，名称改为：`quantized-community-speed-preview`。同样记下它的 **Database ID**。

创建内容：第 2 个空的 D1 数据库。费用：0。

## 第 3 步：在两个数据库里建表

对**两个数据库分别**操作：

1. 打开数据库，进入 **Console**（控制台）标签页。
2. 粘贴下面整段 SQL，点 **Execute**（执行）：

```sql
CREATE TABLE IF NOT EXISTS pending_speed (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  day TEXT NOT NULL,
  client_tag TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS pending_speed_day_client ON pending_speed (day, client_tag);
```

如果 Console 一次只能执行一条语句，就分两次执行：先执行 `CREATE TABLE ...;`，再执行 `CREATE INDEX ...;`。

3. 再执行下面这句做检查：

```sql
SELECT name FROM sqlite_master WHERE name LIKE 'pending_speed%';
```

结果应该有两行：`pending_speed` 和 `pending_speed_day_client`。

创建内容：每个数据库里 1 张空表和 1 个索引（待审核的提交存在这张表里）。费用：0，只用掉极少的免费写入额度。

## 第 4 步：设置防刷密钥（两个环境各一个，值不同）

这个密钥只用来把访客 IP 变成不可逆的标识，限制同一个人每天的提交次数。

1. 生成两个不同的随机值。浏览器里按 F12 打开开发者工具，切到 Console，粘贴下面这行代码并回车，每运行一次得到一个随机值：

```js
Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')
```

2. 进入 **Workers & Pages → `quantized`（Pages 项目）→ Settings → Variables and Secrets**。
3. 点 **Add**（添加），类型选 **Secret**（加密），**不要选 Plaintext**：
   - 名称：`COMMUNITY_SPEED_RATE_SECRET`
   - 值：第一个随机值
   - 环境：**Production**
4. 再添加一次，名称相同，值用**第二个随机值**，环境选 **Preview**。
5. 保存。**不要把这两个值发给任何人**，也不要写进聊天或文件。以后不需要再用到它们。

如果页面提示“变量由 wrangler 配置文件管理”：Secret 仍然可以在控制台添加。如果确实无法添加 Secret，停下来告诉主人。

创建内容：Pages 项目上的 2 个加密变量。费用：0。

## 完成后交回给我们的内容（主人转给 Devin）

请把下面这些发给主人，由主人转给 Devin：

1. `quantized-community-speed` 的 **Database ID**
2. `quantized-community-speed-preview` 的 **Database ID**
3. 一句确认：“两个数据库的 SQL 都执行成功，检查结果有 `pending_speed` 和 `pending_speed_day_client`。”
4. 一句确认：“`COMMUNITY_SPEED_RATE_SECRET` 已在 Production 和 Preview 各设置一个不同的 Secret。”（**只确认，不要发密钥的值**）

Database ID 不是密码，可以放心转发。

## 之后由我们完成的事（不需要你操作）

Devin 收到两个 Database ID 后，会在代码仓库里提交一次修改：把两个 ID 写进 `wrangler.toml`，并把功能开关 `COMMUNITY_SPEED_ENABLED` 改为 `true`。这个修改先在预览环境测试，主人说“合并”后才上线。上线前网站上**不会出现**提交表单。

## 附：以后如何查看待审核的提交（主人或审核者用）

进入 D1 → `quantized-community-speed` → Console，执行：

```sql
SELECT id, received_at, payload FROM pending_speed ORDER BY received_at DESC LIMIT 100;
```

这里只能看到提交，看到的内容不会出现在网站上。某条提交审核通过后，由 Devin 在仓库里提一个数据 PR，把它加进来，合并后才会在网站上显示为“社区数据”，不会显示为“实测”。
