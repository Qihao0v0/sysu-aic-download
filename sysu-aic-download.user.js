// ==UserScript==
// @name         逸仙智课目录下载
// @namespace    sysu-aic-download
// @version      0.1.0
// @description  在课程目录中为文件添加直接下载链接
// @match        https://aic.sysu.edu.cn/aic/*
// @grant        none
// @run-at       document-idle
// @license      GPL-3.0-only
// ==/UserScript==

// Copyright (C) 2026 Qihao
//
// SPDX-License-Identifier: GPL-3.0-only
(() => {
  'use strict';

  const INSTANCE = '__sysuAicDownload';
  const LINK_CLASS = 'sysu-aic-download';

  // 支持重复运行
  window[INSTANCE]?.();
  document.querySelectorAll(`.${LINK_CLASS}`).forEach(el => el.remove());

  function enhance() {
    const nodes = document.querySelectorAll('.el-tree-node[data-key]');

    for (const node of nodes) {
      const row = node.querySelector(':scope > .el-tree-node__content');
      if (!row || row.querySelector(`.${LINK_CLASS}`)) continue;
      if (!row.querySelector('.file-icon')) continue;
      if (row.querySelector('.aloha-icon-resource-lock')) continue;

      const nameElement = row.querySelector('.file-name');
      const name = nameElement?.textContent.trim();
      const fileId = node.dataset.key;
      if (!name || !fileId) continue;

      const url = new URL(
        '/cloud/basic-resource/file/download',
        location.origin
      );
      url.search = new URLSearchParams({ fileId, fileName: name });

      const link = document.createElement('a');
      link.className = LINK_CLASS;
      link.textContent = '下载';
      link.href = url.href;
      link.download = name;
      link.title = `下载 ${name}`;
      link.style.cssText =
        'margin-left:12px;color:#1677ff;font-size:13px;flex-shrink:0';

      // 保留链接的原生操作，阻止目录节点接收点击
      for (const event of ['click', 'dblclick']) {
        link.addEventListener(event, e => e.stopPropagation());
      }

      nameElement.after(link);
    }
  }

  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(enhance, 150);
  });

  window[INSTANCE] = () => {
    observer.disconnect();
    clearTimeout(timer);
  };

  enhance();
  observer.observe(document.body, { childList: true, subtree: true });
})();