---
purpose: Danny edits real stock and website content and saves it directly to the live website.
status: implemented
date: 2026-10-22
domain: system
subject: vehicles identified by stock ID and the website content used to sell them
roles: [Danny as the authenticated owner]
structure: registry
secondary_structure: console
hook:
  text: Show the last successful live update and the next real content issue to resolve.
  fields: [publication.updatedAt, publication.revision, vehicles.status, vehicles.coverImageUrl]
  writers: {publication: system after successful commit, vehicles: owner, issue_counts: derived}
  cadence: after loading or saving
  disconnected: Show the last confirmed publication time and a connection error; never claim local edits are live.
cold_start:
  day_1: Add your first vehicle and its photographs.
  no_issues: Website content is up to date. Choose a vehicle to edit.
  no_publication: No cloud publication yet. Review the existing live inventory before the first publication.
home: [live save status, add-or-find-vehicle action, real issues needing attention, recently edited vehicles]
channels:
  - name: Overview
    does: Show what is live and what actually needs attention.
    pages: [{level: L1, shows: compact status strip followed by task list and recent vehicles}]
  - name: Vehicles
    does: Find a car, change its facts, price, availability and photographs.
    pages:
      - {level: L1, shows: searchable stock rows with photo, name, stock ID, price and status}
      - {level: L2, shows: focused vehicle editor grouped into basics, photos and documented specifications}
      - {level: L3, shows: photo framing and ordering editor}
  - name: Website Content
    does: Edit homepage and genuine handover stories without mixing all forms together.
    pages:
      - {level: L1, shows: Homepage and Deliveries subnavigation}
      - {level: L2, shows: homepage preview and content controls OR delivery thumbnail list}
      - {level: L3, shows: one delivery editor with large photo, clear fields and advanced video disclosure}
  - name: Services & Tint
    does: Manage the existing XPEL and 3M packages.
    pages: [{level: L1, shows: concise package list}, {level: L2, shows: one package editor}]
  - name: Settings
    does: Manage business contact, appearance and finance assumptions.
    pages: [{level: L1, shows: grouped settings with clear section labels}]
  - name: Advanced
    does: Access backups, previous publication recovery and existing technical tools.
    pages: [{level: L1, shows: recovery actions and collapsed advanced controls}]
entities:
  - name: Vehicle
    fields: [id, stockId, priceRm, status, gallery, specifications]
    written_by: {id: system, stockId: owner, priceRm: owner, status: owner, gallery: owner, specifications: owner}
    relations: [Vehicle has many Media]
  - name: Media
    fields: [id, url, crop, category]
    written_by: {id: system, url: authenticated upload service, crop: owner, category: owner}
  - name: WebsiteContent
    fields: [homepage, deliveries, tintPackages, contact]
    written_by: {homepage: owner, deliveries: owner, tintPackages: owner, contact: owner}
  - name: Publication
    fields: [revision, updatedAt, previousSnapshot]
    written_by: {revision: system, updatedAt: system, previousSnapshot: system}
depends_on: [existing Cloudflare authenticated content and media APIs; legacy GitHub Pages reads the public cloud snapshot]
mvp: [theme defect fixes, header and language control, task hierarchy, explicit save-and-go-live]
later: [optional independent GitHub publication pipeline if hosting is migrated away from Cloudflare]
visual: Midnight navy, warm white and royal blue; light content surfaces in Day, navy content surfaces in Night; photography retains its original colors.
seam: {type: none, why: owner administration supports vehicle sales}
excluded: [fabricated statistics, invented enquiries inbox, full drag-and-drop website builder, ChatGPT navigation item, automatic public updates on every keystroke]
deferred: [multi-owner roles, video file hosting, independent GitHub publishing]
---

# Danny 店主后台调整方案（已确认，实施中）

## 这个台子是给谁的
Danny 日常管理现车、价钱、照片、交车记录和贴膜服务。围绕「找到一台车，改好，保存上线」组织页面。原 spec.md 记载的无登录、纯浏览器保存已被后续明确要求取代；保留原文件作为历史，不按旧限制重新设计。

## 每天怎么用
进入概览看上次上线时间，直接搜车或添加车辆。编辑页只突出一个主要动作「保存并上线」，旁边保留次要「存为草稿」和「预览」。先验证必要信息和照片上传，再按修订号提交。保存成功后显示上线时间及查看网站入口；失败则保留输入，明确指出尚未上线。

保存当前对象只发布当前对象的改动，不顺带公开其他未确认草稿。用当前已发布快照合并该对象，以免全站草稿被意外发布。首次云端发布先建立并核对现有线上内容基线。保留冲突检查、原有权限、媒体可见性和上一版恢复。

## 页面层次
侧栏按「日常管理：概览、车辆」「网站内容：首页与交车、Services & Tint」「管理：设置、高级」分组。照片管理放进车辆编辑，另保留媒体入口供集中处理，不重复一整套操作。交车先显示缩略图、标题和展示状态；点击一项才编辑详情，避免多张巨大表单同时展开。

## 网站导航及语言
Header: Home / Inventory / Services & Tint / Contact。Calculator 从头部移除，保留车辆详情入口，独立 Calculator & JPJ 页从页脚进入。Services & Tint 恢复头部，是明确业务入口。无需增加 ChatGPT 或文案功能导航。

语言控件改为紧凑按钮及同主题小菜单，显示 English / 简体中文 / Bahasa Melayu，当前项带勾。支持键盘、Esc、点击外部关闭、触屏和焦点返回。

## 立即修复及验收
页脚品牌、分组标题在 Day 使用深海军蓝近黑色，正文次级灰；Night 使用浅色。检查所有嵌套主题变量及覆盖规则。交车、照片、贴膜、报告、筛选、弹窗和吸底保存栏统一消费主题色，清理硬编码黑背景。

实际验证 Cloudflare 和 GitHub Pages 的浅深主题、刷新持久化、手机布局、语言菜单键盘操作；验证保存一辆车和一条交车记录后，新访客读取新内容，同时其他草稿仍私有；验证断网、冲突、缺照片时不假报成功；核对登录保护和回滚。

## 已经想过但没做的
不加假营收图表、假客户请求、地图和不相关 AI 入口。普通内容保存通过现有云端接口，不要求 Danny 复制文件或操作 GitHub。GitHub 仓库代码与云端内容是两件事；若将来完全停用 Cloudflare，需要单独设计 GitHub 发布后端和安全授权，当前方案不声称已支持脱离 Cloudflare。

## 给实现方
本文件经 Danny 确认后实施。沿用现有认证和内容存储；发布当前对象采用对象范围的合并与修订检查，不能直接把全站 draft 传给 publish。首页数据均来自真实记录与服务端发布结果，空状态提供下一步动作。实际验证与限制记录在 gemini-site/OWNER-WORKFLOW-VERIFICATION.md。
