# 简历（CV）

简历相关的文件现在**只有这一处**：LaTeX 源码和编译出的 PDF 放在一起，中英文各一套。
（以前散落在 `assets/`、备份盘的 `LaTeX/`、`PDF/` 三个地方，同一个 PDF 存了三四份。）

## 目录结构

```
cv/
├── Makefile                    # 一键编译
├── en/                         # 英文版
│   ├── resume.tex              # 主文件：联系方式、章节顺序
│   ├── TLCresume.sty           # 版式/样式
│   ├── sections/               # 各节正文
│   │   ├── _header.tex         # 抬头（姓名、电话、邮箱、主页）
│   │   ├── education.tex
│   │   ├── experience.tex
│   │   ├── project.tex
│   │   └── skills.tex
│   └── Jialiang-Li-CV-EN.pdf   # 编译产物，首页的 CV 按钮指向这里
└── zh/                         # 中文版，结构同上
    └── Jialiang-Li-CV-CN.pdf
```

## 约定

- **改内容**只动 `sections/*.tex`；章节顺序、联系方式在 `resume.tex`；版式在 `TLCresume.sty`。
- `TLCresume.sty` 两种语言各存一份（目前内容完全相同），改样式时两边同步。
- **PDF 命名固定**为 `Jialiang-Li-CV-<EN|CN>.pdf`，和源码同目录；仓库里每个 PDF 只存这一份，不再往 `assets/` 另放一份。
- 站点首页（`index.html` 联系方式区块的 CV 按钮）通过 `data-en-href` / `data-zh-href` 指向这里的两个 PDF，换新版直接覆盖同名文件即可，链接不用改。
- **历史版本不进仓库**：这是公开的 GitHub Pages 仓库，旧简历（旧的 PDF、`202611` 之类的 zip）留在备份盘 `~/Documents/Backup/CV/`，避免旧版本被公开访问，也避免仓库越滚越大。

## 编译

需要 MacTeX（含 `xelatex`，中文版靠 `ctex` 宏包，必须 XeLaTeX）。本机目前**尚未安装 LaTeX 和 Homebrew**，所以直接 `make` 会失败，先装 MacTeX：

- 官方安装包：<https://tug.org/mactex/>（`MacTeX.pkg`，约 6 GB，装完 `xelatex` 就在 PATH 里）
- 装了 Homebrew 之后也可以：`brew install --cask mactex-no-gui`

只需要临时编译的话，也可以在 GitHub Actions 或 Overleaf 里用同一套源码。

编译：

```bash
cd cv
make        # 中英文都编译
make en     # 只编译英文
make zh     # 只编译中文
make clean  # 清掉中间文件（aux/log/fls...）
```

等价的手动命令：

```bash
cd cv/en && latexmk -xelatex -jobname=Jialiang-Li-CV-EN resume.tex
cd cv/zh && latexmk -xelatex -jobname=Jialiang-Li-CV-CN resume.tex
```

中间文件已被 `cv/.gitignore` 忽略；PDF 是故意纳入 git 的（就是网站上提供下载的那份）。

## 中文字体说明

仓库里现在的两份 PDF 都是 **2026-11-18 在 Windows（Ctex）上编译** 的产物。`ctex` 会按平台自动选字体：Windows 用中易宋体（SimSun），macOS 默认用 Songti SC —— 在 Mac 上重编译后，字形、行距、断行会有细微差别，属于正常现象。若要 1:1 复现 Windows 上的观感，安装 Windows 字体后把 `zh/resume.tex` 里的

```tex
\usepackage[UTF8]{ctex}
```

改成

```tex
\usepackage[UTF8, fontset=windows]{ctex}
```

## 模板来源

TLCresume 模板：TimmyChan → gobborg → mengisok，本人按需修改。
