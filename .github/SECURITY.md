# Security Policy

## GitHub Actions 安全扫描配置

本项目已配置了以下安全扫描工作流程：

### 1. CodeQL 代码分析 (`.github/workflows/codeql.yml`)

- **触发条件**:
  - 推送到 `master` 或 `main` 分支
  - 创建Pull Request
  - 每周一凌晨3:30定时运行

- **功能**:
  - 自动检测JavaScript代码中的安全漏洞
  - 使用 `security-extended` 和 `security-and-quality` 查询集
  - 支持自定义构建流程

### 2. 综合安全扫描 (`.github/workflows/security.yml`)

- **触发条件**:
  - 推送到 `master` 或 `main` 分支
  - 创建Pull Request
  - 每周一早上6点定时运行

- **功能**:
  - **依赖项安全扫描**: 使用 `npm audit` 和 `Snyk` 检查依赖项漏洞
  - **许可证合规检查**: 使用 `license-checker` 检查依赖项许可证
  - **代码质量检查**: 使用 `ESLint` 进行代码质量检查

## 配置说明

### 必需的 GitHub Secrets

为了使 Snyk 扫描正常工作，需要配置以下 secrets：

1. 前往 [Snyk.io](https://snyk.io) 注册账户
2. 获取您的 API Token
3. 在 GitHub 仓库设置中添加 secret：
   - Name: `SNYK_TOKEN`
   - Value: 您的 Snyk API Token

### CodeQL 配置文件

CodeQL 配置文件位于 `.github/codeql-config.yml`，包含以下设置：

- **扫描路径**: `src/`, `tool/`, `gulpfile.js`
- **排除路径**: `build/`, `dist/`, `examples/`, 第三方依赖
- **查询集**: `security-extended`, `security-and-quality`

### 自定义配置

您可以根据项目需求修改以下配置：

1. **修改扫描路径**: 编辑 `.github/codeql-config.yml` 中的 `paths` 和 `paths-ignore`
2. **调整触发条件**: 编辑工作流程文件中的 `on` 部分
3. **修改安全级别**: 调整 `npm audit` 和 `Snyk` 的严重性阈值

## 查看扫描结果

1. **CodeQL 结果**: 在 GitHub 的 "Security" 标签页中查看
2. **工作流程日志**: 在 "Actions" 标签页中查看详细日志
3. **Pull Request 检查**: 在 PR 页面查看自动检查结果

## 报告安全问题

如果发现安全问题，请：

1. 不要在公开的 issue 中报告安全漏洞
2. 发送邮件到项目维护者
3. 包含尽可能详细的信息以便重现问题

## 支持的扫描类型

- ✅ SQL 注入检测
- ✅ 跨站脚本攻击 (XSS)
- ✅ 路径遍历攻击
- ✅ 代码注入
- ✅ 不安全的随机数生成
- ✅ 依赖项漏洞扫描
- ✅ 许可证合规检查
- ✅ 代码质量检查
