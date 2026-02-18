---
title: Steam Deck
---
## 前言
去年入手一台日版512G Steam Deck OLED，入手原因是我有玩游戏的需求，而我的电脑太重了，不想上下班来回背着。其实一直想把电脑换掉，但没有合适的选择（~~主要是没钱~~），选来选去最终决定入手Steam Deck。到手后已经使用了一段时间，也吃灰了一段时间，满分一百分的话我给这台设备打80分，下面详细介绍一下使用和折腾情况。

## 游戏情况
Steam Deck刚到手后，我玩的比较多的游戏是[Half Life 2](https://store.steampowered.com/app/220/HalfLife_2/)，通关了主线剧情。这是一款二十多年前发布的游戏，游玩下来相当惊艳，游戏主界面和电脑上略有不同，应该是V社有对Steam Deck做单独优化，另外在Steam Deck上按左触摸板还有快捷保存功能，不过容易误触。虽然是一款第一人称射击游戏，但用手柄操作体验相等好，相比之下我玩的比较多的另一款第一人称射击游戏[Insurgency: Sandstorm](https://store.steampowered.com/app/581320/Insurgency_Sandstorm/)在Steam Deck上体验很差，最大的问题是视角切换不灵敏，完全没法达到电脑上使用键鼠的流畅度

之后玩的比较多的是[Brotato](https://store.epicgames.com/en-US/p/brotato-ed4097)，我只有Epic版本，所以是在桌面模式下用 [Heroic](https://heroicgameslauncher.com/)玩的，配合Steam Deck的按键会有一些误触的情况，不过影响不大

其他游戏暂时先不过多展开


| 游戏                                                                                       | 游玩感受                                    | ProtonDB评级                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| [Half Life 2](https://store.steampowered.com/app/220/HalfLife_2/)                        | &starf; &starf; &starf; &starf; &star;  | <font color="#b4c7dc">白金</font> |
| [Dead Space](https://store.steampowered.com/app/1693980/_/)                              | &starf; &starf; &starf; &starf; &star;  | <font color="#cfb53b">金</font>  |
| [Stardew Valley](https://store.steampowered.com/app/413150/Stardew_Valley/)              | &starf; &starf; &starf; &starf; &starf; | <font color="#b4c7dc">白金</font> |
| [Insurgency: Sandstorm](https://store.steampowered.com/app/581320/Insurgency_Sandstorm/) | &starf; &starf; &star; &star; &star;    | <font color="#cfb53b">金</font>  |

[ProtonDB](https://www.protondb.com/)评级
- <font color="#00b050">原生</font>
- <font color="#b4c7dc">白金</font>
- <font color="#cfb53b">金</font>
- <font color="#a6a6a6">银</font>
- <font color="#cd7f32">铜</font>
- <font color="#ff0000">不可玩</font>


## 折腾

### 配置桌面模式账户

首先进入桌面模式，为Linux系统配置账户。

1. 点击开始图标，再点击开始菜单中的`SteamOS User`，进入用户设置页面
2. 点击修改密码按钮，为账户设置一个密码

### 禁用steamos只读模式
为了修改steamos的文件系统，需要禁用只读模式，这是后续折腾的基础
```bash
sudo steamos-readonly disable
```
 
### 修改软件商店镜像源
steamos没有安装完整的浏览器，需要通过软件商店下载，为了能够访问软件商店，需要修改软件商店的镜像源
```bash
flatpak remote-modify flathub --url=http://mirror.sjtu.edu.cn/flathub
```
修改完后重启系统，然后进入软件商店下载浏览器

### 桌面模式常用软件

1. [LocalSend](https://localsend.org/zh-CN/download?os=linux)，用来和其他设备互传文件、剪贴板非常方便。使用官网提供的命令安装或从软件商店下载
```bash
flatpak install flathub org.localsend.localsend_app
```

2. ToDesk，[官方](https://www.todesk.com/linux.html)的Arch版本安装后会提示版本过低，无法使用，推荐使用[这个版本](https://gitee.com/mclanbai/archtodesk)
```bash
curl -L todesk.lanbai.top | sh
```

3. [Heroic](https://heroicgameslauncher.com/)，可以在桌面模式下玩Epic等平台的游戏，可以从软件商店下载

### 安装Decky Loader
[Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader)用来下载Steam Deck第三方插件，安装步骤：

切换到游戏模式
1. 进入**系统**设置，选择**启用开发者模式**
2. 进入开发者模式，打开**CEF 远程调试**

切换到桌面模式，使用下方命令安装
```bash
curl -L https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/install_release.sh | sh
```

### 安装Decky Clash 插件
使用[Decky Clash](https://github.com/chenx-dust/DeckyClash) 可以在游戏模式下访问Steam社区，用来查攻略很方便。但是从Decky Loader商店安装总是失败，可能是网络原因，可以使用[离线方式](https://github.com/chenx-dust/DeckyClash/blob/main/README_CN.md#%E7%A6%BB%E7%BA%BF%E5%AE%89%E8%A3%85%E5%8C%85)安装

### 有线方式连接电脑
Steam Deck默认状态下用数据线连接电脑是没反应的，如果需要用有线方式在Steam Deck和电脑间传文件，可以用以下方法：
1. Steam Deck关机，按住`音量+`，再按`开机键`，进入BIOS
2. 进入`Setup Utility > 进阶 > USB设定`
3. 点击`USB Dual Role Device`，选择`DRD`
4. 点击储存并关闭
5. 从Decky Loader商店安装[Deck MTP](https://github.com/dafta/DeckMTP)，在插件中选择`Enable MTP`
