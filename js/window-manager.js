export function createWindowManager({ windowsLayerId = "windows-layer", taskButtonsId = "task-buttons" } = {}) {
  const ICON_MINIMIZE_URL = new URL("../assets/icons/16/window-minimize.png", import.meta.url).href;
  const ICON_MAXIMIZE_URL = new URL("../assets/icons/16/window-maximize.png", import.meta.url).href;
  const ICON_RESTORE_URL = new URL("../assets/icons/16/window-restore.png", import.meta.url).href;
  const ICON_CLOSE_URL = new URL("../assets/icons/16/window-close.png", import.meta.url).href;
  const ICON_OFFICE_DOC_URL = new URL("../assets/icons/16/x-office-document.png", import.meta.url).href;
  const ICON_OFFICE_DOC_32_URL = new URL("../assets/icons/32/x-office-document.png", import.meta.url).href;
  const ICON_NOTEPAD_URL = new URL("../assets/icons/48/w98_notepad.ico", import.meta.url).href;
  const ICON_FIND_URL = new URL("../assets/icons/48/w2k_find.ico", import.meta.url).href;
  const ICON_FOLDER_16_URL = new URL("../assets/icons/16/folder.png", import.meta.url).href;
  const ICON_FOLDER_32_URL = new URL("../assets/icons/32/folder.png", import.meta.url).href;
  const ICON_NEW_DOCUMENT_URL = new URL("../assets/icons/16/x-office-document.png", import.meta.url).href;
  const ICON_OPEN_FOLDER_URL = new URL("../assets/icons/16/folder.png", import.meta.url).href;
  const ICON_SAVE_URL = new URL("../assets/icons/48/w98_write_file.ico", import.meta.url).href;
  const ICON_PRINT_URL = new URL("../assets/icons/48/w2k_printer.ico", import.meta.url).href;
  const ICON_GENERIC_FILE_32_URL = new URL("../assets/icons/48/w2k_unknown_filetype.ico", import.meta.url).href;

  const UNSUPPORTED_EXPLORER_TYPES = new Set(["jpeg", "png", "mpeg", "mp3", "file"]);

  const windowsLayer = document.getElementById(windowsLayerId);
  const taskButtonsContainer = document.getElementById(taskButtonsId);

  if (!windowsLayer || !taskButtonsContainer) {
    throw new Error("Window manager could not find required DOM containers.");
  }

  let topZ = 10;
  let winCounter = 0;
  const windowsMap = new Map();

  function normalizeFolderPath(value = "") {
    return String(value)
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
  }

  function fillWindowToDesktop(el) {
    const layerBounds = windowsLayer.getBoundingClientRect();
    el.style.left = "0";
    el.style.top = "0";
    el.style.width = `${Math.max(0, Math.floor(layerBounds.width))}px`;
    el.style.height = `${Math.max(0, Math.floor(layerBounds.height))}px`;
  }

  function shouldRenderWord(state) {
    return state.kind === "document" && state.app === "word";
  }

  function getWordPageMetrics(state) {
    const documentArea = state.el.querySelector(".document-area");
    if (!documentArea) {
      return {
        width: 620,
        height: Math.round(620 * 1.4142),
        gap: 24
      };
    }

    if (state.locked && state.fullscreen) {
      return {
        width: Math.max(280, Math.floor(documentArea.clientWidth - 20)),
        height: Math.max(220, Math.floor(documentArea.clientHeight - 20)),
        gap: 0
      };
    }

    const areaWidth = Math.max(320, Math.floor(documentArea.clientWidth));
    const targetWidth = state.maximized
      ? Math.round(areaWidth * 0.8)
      : Math.min(660, Math.round(areaWidth * 0.92));
    const pageWidth = Math.max(440, targetWidth);

    return {
      width: pageWidth,
      height: Math.round(pageWidth * 1.4142),
      gap: 24
    };
  }

  function createWordPage(metrics) {
    const page = document.createElement("section");
    page.className = "paper word-page";
    page.style.width = `${metrics.width}px`;
    page.style.height = `${metrics.height}px`;

    const body = document.createElement("div");
    body.className = "word-page-body";
    page.appendChild(body);

    return { page, body };
  }

  function cloneRenderableWordNodes(nodeList) {
    const nodes = [];
    nodeList.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const p = document.createElement("p");
        p.textContent = text;
        nodes.push(p);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        nodes.push(node.cloneNode(true));
      }
    });

    return nodes;
  }

  function findBlogPostRoot(template) {
    return Array.from(template.content.children).find((element) => {
      if (element.tagName.toLowerCase() !== "article") return false;
      return (
        element.classList.contains("blog-post") ||
        element.dataset.published ||
        element.dataset.project ||
        element.dataset.subtitle
      );
    });
  }

  function inferProjectNameFromFile(file = "") {
    const match = String(file).match(/(?:^|\/)mydocuments\/([^/]+)/);
    if (!match) return "";

    const folderName = decodeURIComponent(match[1]).replace(/^\d+[-_]?/, "");
    if (!folderName) return "";

    const spaced = folderName.replace(/[-_]+/g, " ").trim();
    if (/[A-Z]/.test(spaced)) return spaced;

    return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatPublishedDate(value = "") {
    const trimmed = String(value || "").trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return trimmed;

    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (Number.isNaN(date.getTime())) return trimmed;

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function getReadingTimeLabel(nodes) {
    const scratch = document.createElement("div");
    nodes.forEach((node) => scratch.appendChild(node.cloneNode(true)));

    const text = (scratch.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return "";

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 225));
    return `${minutes} min read`;
  }

  function createMetaItem(text) {
    const item = document.createElement("span");
    item.className = "post-meta-item";
    item.textContent = text;
    return item;
  }

  function createPublishedMetaItem(dateValue) {
    const item = document.createElement("span");
    item.className = "post-meta-item";
    item.appendChild(document.createTextNode("Published: "));

    const time = document.createElement("time");
    time.dateTime = dateValue;
    time.textContent = formatPublishedDate(dateValue);
    item.appendChild(time);

    return item;
  }

  function createPostHeader({ headingNode, metadata, readingTime }) {
    const header = document.createElement("section");
    header.className = "post-header";

    header.appendChild(headingNode.cloneNode(true));

    const meta = document.createElement("p");
    meta.className = "post-meta";

    if (metadata.published) {
      meta.appendChild(createPublishedMetaItem(metadata.published));
    }
    if (metadata.project) {
      meta.appendChild(createMetaItem(metadata.project));
    }
    if (readingTime) {
      meta.appendChild(createMetaItem(readingTime));
    }
    if (meta.children.length > 0) {
      header.appendChild(meta);
    }

    if (metadata.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.className = "post-subtitle";
      subtitle.textContent = metadata.subtitle;
      header.appendChild(subtitle);
    }

    const rule = document.createElement("hr");
    rule.className = "post-rule";
    header.appendChild(rule);

    return header;
  }

  function enhanceBlogPostNodes(nodes, postRoot, state) {
    if (!postRoot) return nodes;

    const headingIndex = nodes.findIndex((node) => {
      return node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "h1";
    });
    if (headingIndex === -1) return nodes;

    const metadata = {
      published: String(postRoot.dataset.published || "").trim(),
      project: String(postRoot.dataset.project || "").trim() || inferProjectNameFromFile(state.file),
      subtitle: String(postRoot.dataset.subtitle || "").trim()
    };
    const readingTime = getReadingTimeLabel(nodes);
    const header = createPostHeader({
      headingNode: nodes[headingIndex],
      metadata,
      readingTime
    });

    return [
      ...nodes.slice(0, headingIndex),
      header,
      ...nodes.slice(headingIndex + 1)
    ];
  }

  function sanitizeWordNodes(rawHtml, state) {
    const template = document.createElement("template");
    template.innerHTML = rawHtml;

    const postRoot = findBlogPostRoot(template);
    const sourceNodes = postRoot ? postRoot.childNodes : template.content.childNodes;
    const nodes = cloneRenderableWordNodes(sourceNodes);

    return enhanceBlogPostNodes(nodes, postRoot, state);
  }

  function splitNodeByWords(node, testBody) {
    const text = (node.textContent || "").trim();
    if (!text) return { headNode: null, tailNode: null };

    const words = text.split(/\s+/);
    if (words.length < 2) return { headNode: node, tailNode: null };

    const head = node.cloneNode(false);
    let low = 1;
    let high = words.length;
    let fitCount = 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      head.textContent = words.slice(0, mid).join(" ");
      testBody.appendChild(head);
      const fits = testBody.scrollHeight <= testBody.clientHeight;
      testBody.removeChild(head);

      if (fits) {
        fitCount = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    head.textContent = words.slice(0, fitCount).join(" ");
    const tailText = words.slice(fitCount).join(" ");
    if (!tailText) {
      return { headNode: head, tailNode: null };
    }

    const tail = node.cloneNode(false);
    tail.textContent = tailText;
    return { headNode: head, tailNode: tail };
  }

  function appendNodeToPagedWord(node, pagesContainer, currentBody, metrics) {
    const candidate = node.cloneNode(true);
    currentBody.appendChild(candidate);

    if (currentBody.scrollHeight <= currentBody.clientHeight) {
      return currentBody;
    }

    currentBody.removeChild(candidate);

    if (currentBody.children.length === 0) {
      const { headNode, tailNode } = splitNodeByWords(candidate, currentBody);
      if (headNode) {
        currentBody.appendChild(headNode);
      }

      if (tailNode) {
        const next = createWordPage(metrics);
        pagesContainer.appendChild(next.page);
        next.body.appendChild(tailNode);
        return next.body;
      }

      return currentBody;
    }

    const next = createWordPage(metrics);
    pagesContainer.appendChild(next.page);
    next.body.appendChild(candidate);

    if (next.body.scrollHeight > next.body.clientHeight && next.body.children.length === 1) {
      next.body.removeChild(candidate);
      const { headNode, tailNode } = splitNodeByWords(candidate, next.body);
      if (headNode) {
        next.body.appendChild(headNode);
      }
      if (tailNode) {
        const extra = createWordPage(metrics);
        pagesContainer.appendChild(extra.page);
        extra.body.appendChild(tailNode);
        return extra.body;
      }
    }

    return next.body;
  }

  function updateWordPageIndicator(state) {
    const indicator = state.el.querySelector(".page-indicator");
    if (!indicator) return;

    const pages = state.el.querySelectorAll(".word-page");
    const totalPages = pages.length || 1;
    const documentArea = state.el.querySelector(".document-area");

    let currentPage = 1;
    if (documentArea && state.wordLayout) {
      const step = state.wordLayout.height + state.wordLayout.gap;
      currentPage = Math.floor((documentArea.scrollTop + 8) / step) + 1;
      currentPage = Math.max(1, Math.min(totalPages, currentPage));
    }

    indicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  function renderWordDocument(state) {
    if (!state.wordSourceHtml) return;

    const pagesContainer = state.el.querySelector(".word-pages");
    const documentArea = state.el.querySelector(".document-area");
    if (!pagesContainer || !documentArea) return;

    const metrics = getWordPageMetrics(state);
    state.wordLayout = metrics;

    const nodes = sanitizeWordNodes(state.wordSourceHtml, state);
    pagesContainer.innerHTML = "";

    const firstPage = createWordPage(metrics);
    pagesContainer.appendChild(firstPage.page);

    let cursor = firstPage.body;
    nodes.forEach((node) => {
      cursor = appendNodeToPagedWord(node, pagesContainer, cursor, metrics);
    });

    if (!state.wordScrollHandler) {
      state.wordScrollHandler = () => updateWordPageIndicator(state);
      documentArea.addEventListener("scroll", state.wordScrollHandler);
    }

    updateWordPageIndicator(state);
  }

  function setWordZoomClass(state) {
    if (!shouldRenderWord(state)) return;
    state.el.classList.toggle("word-maximized", Boolean(state.maximized));
  }

  function bringToFront(winId) {
    const state = windowsMap.get(winId);
    if (!state || !state.el) return;

    topZ += 1;
    state.el.style.zIndex = topZ;

    windowsMap.forEach((winState) => {
      if (winState.taskBtn) {
        winState.taskBtn.classList.remove("active-task");
      }
    });

    if (state.taskBtn) {
      state.taskBtn.classList.add("active-task");
    }
  }

  function setWindowPosition(el) {
    const offset = (winCounter % 8) * 24;
    el.style.left = `${220 + offset}px`;
    el.style.top = `${70 + offset}px`;
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return entities[character];
    });
  }

  function buildMenuItem({ label, command = "", enabled = false, separator = false }) {
    if (separator) {
      return `<li class="menu-separator" role="separator"></li>`;
    }

    const commandAttr = command ? ` data-command="${escapeHtml(command)}"` : "";
    const disabledAttr = enabled ? "" : " disabled aria-disabled=\"true\"";
    return `
      <li class="menu-dropdown-row">
        <button class="menu-command" type="button"${commandAttr}${disabledAttr}>
          ${escapeHtml(label)}
        </button>
      </li>
    `;
  }

  function getMenuItems(menuName, capabilities = {}) {
    if (menuName === "File") {
      return [
        { label: "New" },
        { label: "Open..." },
        { separator: true },
        { label: "Save", command: "save", enabled: Boolean(capabilities.save) },
        { label: "Save As...", command: "save-as", enabled: Boolean(capabilities.saveAs) },
        { separator: true },
        { label: "Page Setup..." },
        { label: "Print..." },
        { separator: true },
        { label: "Properties" },
        { label: "Exit" }
      ];
    }

    const disabledMenus = {
      Edit: ["Undo", "Cut", "Copy", "Paste", "Delete", "Select All", "Find..."],
      Search: ["Find...", "Find Next", "Replace...", "Go To..."],
      View: ["Normal", "Web Layout", "Print Layout", "Toolbars", "Zoom..."],
      Insert: ["Break...", "Page Numbers...", "Date and Time...", "Picture..."],
      Format: ["Font...", "Paragraph...", "Bullets and Numbering..."],
      Tools: ["Spelling and Grammar...", "Word Count...", "Options..."],
      Table: ["Insert Table...", "Delete", "Select", "Table Properties..."],
      Window: ["New Window", "Arrange All", "Split"],
      Go: ["Back", "Forward", "Up One Level", "Home Page"],
      Favorites: ["Add to Favorites...", "Organize Favorites..."],
      Help: ["Help Topics", "About"]
    };

    return (disabledMenus[menuName] || ["Unavailable"]).map((label) => ({ label }));
  }

  function buildMenuBarMarkup(menuNames, capabilities = {}) {
    return `
      <nav class="menu-bar" aria-label="Window menu">
        ${menuNames
          .map((menuName) => {
            const items = getMenuItems(menuName, capabilities).map(buildMenuItem).join("");
            return `
              <div class="menu-item">
                <button class="menu-button" type="button">${escapeHtml(menuName)}</button>
                <ul class="menu-dropdown" role="menu">
                  ${items}
                </ul>
              </div>
            `;
          })
          .join("")}
      </nav>
    `;
  }

  function getVisibleWindowFileName(state) {
    const titleEl = state.el.querySelector(".window-title-text");
    const visibleTitle = titleEl ? titleEl.textContent : "";
    return String(visibleTitle || state.name || "document")
      .replace(/\s+-\s+(Microsoft Word|Notepad)$/i, "")
      .trim();
  }

  function buildDownloadFileName(state, extension) {
    const visibleFileName = getVisibleWindowFileName(state);
    const baseName = visibleFileName
      .replace(/\.[^.]+$/, "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "document";

    return `${baseName} - yasinghasemi.com.${extension}`;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function escapeXml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
      };
      return entities[character];
    });
  }

  function normalizePrintableText(value = "") {
    return String(value)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  function collectTextBlocksFromNode(node, blocks) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = normalizePrintableText(node.textContent);
      if (text) blocks.push({ type: "body", text });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tagName = node.tagName.toLowerCase();
    if (tagName === "script" || tagName === "style") return;

    if (tagName === "hr") {
      blocks.push({ type: "rule", text: "" });
      return;
    }

    if (tagName === "h1") {
      blocks.push({ type: "title", text: normalizePrintableText(node.textContent) });
      return;
    }

    if (tagName === "h2" || tagName === "h3") {
      blocks.push({ type: "heading", text: normalizePrintableText(node.textContent) });
      return;
    }

    if (tagName === "p" || tagName === "li") {
      if (node.classList.contains("post-meta")) {
        const metaItems = Array.from(node.querySelectorAll(".post-meta-item"))
          .map((item) => normalizePrintableText(item.textContent))
          .filter(Boolean);
        const metaText = metaItems.length > 0
          ? metaItems.join(" \u00b7 ")
          : normalizePrintableText(node.textContent);
        blocks.push({ type: "meta", text: metaText });
        return;
      }

      const type = node.classList.contains("post-subtitle") ? "subtitle" : "body";
      blocks.push({ type, text: normalizePrintableText(node.textContent) });
      return;
    }

    node.childNodes.forEach((child) => collectTextBlocksFromNode(child, blocks));
  }

  function getWordTextBlocks(state) {
    if (!state.wordSourceHtml) return [];

    const nodes = sanitizeWordNodes(state.wordSourceHtml, state);
    const blocks = [];
    nodes.forEach((node) => collectTextBlocksFromNode(node, blocks));
    return blocks.filter((block) => block.text);
  }

  function getDocumentTextBlocks(state) {
    if (state.app === "word") {
      return getWordTextBlocks(state);
    }

    const text = String(state.sourceText || "")
      .split(/\n{2,}/)
      .map(normalizePrintableText)
      .filter(Boolean);
    return text.map((paragraph, index) => ({
      type: index === 0 ? "title" : "body",
      text: paragraph
    }));
  }

  function getPlainTextContent(state) {
    if (state.app === "notepad") {
      return String(state.sourceText || "");
    }

    return getDocumentTextBlocks(state)
      .map((block) => block.text)
      .join("\n\n");
  }

  const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < table.length; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  })();

  function getCrc32(bytes) {
    let crc = 0xffffffff;
    bytes.forEach((byte) => {
      crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    });
    return (crc ^ 0xffffffff) >>> 0;
  }

  function getZipTimestamp() {
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    return { dosTime, dosDate };
  }

  function createZipBlob(files) {
    const encoder = new TextEncoder();
    const { dosTime, dosDate } = getZipTimestamp();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
      const crc = getCrc32(dataBytes);

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, dosTime, true);
      localView.setUint16(12, dosDate, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, dataBytes.length, true);
      localView.setUint32(22, dataBytes.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      localHeader.set(nameBytes, 30);
      localParts.push(localHeader, dataBytes);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(centralHeader.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, dosTime, true);
      centralView.setUint16(14, dosDate, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, dataBytes.length, true);
      centralView.setUint32(24, dataBytes.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      centralHeader.set(nameBytes, 46);
      centralParts.push(centralHeader);

      offset += localHeader.length + dataBytes.length;
    });

    const centralOffset = offset;
    const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, centralOffset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, endRecord], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  function createDocxParagraph(block) {
    const settings = {
      title: { size: 40, bold: true, color: "000000", after: 130 },
      heading: { size: 30, bold: true, color: "000000", after: 170, before: 140 },
      subtitle: { size: 23, bold: false, color: "333333", after: 0 },
      meta: { size: 18, bold: false, color: "555555", after: 120 },
      body: { size: 22, bold: false, color: "000000", after: 160 }
    }[block.type] || { size: 22, bold: false, color: "000000", after: 160 };

    if (block.type === "rule") {
      return `
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:bottom w:val="single" w:sz="6" w:space="1" w:color="777777"/>
            </w:pBdr>
            <w:spacing w:before="180" w:after="260"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:eastAsia="Tahoma" w:cs="Tahoma"/>
              <w:color w:val="777777"/>
              <w:sz w:val="6"/>
            </w:rPr>
            <w:t xml:space="preserve">________________________________________________________________________________</w:t>
          </w:r>
        </w:p>
      `;
    }

    const bold = settings.bold ? "<w:b/>" : "";
    const before = settings.before ? ` w:before="${settings.before}"` : "";
    return `
      <w:p>
        <w:pPr>
          <w:spacing${before} w:after="${settings.after}" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:eastAsia="Tahoma" w:cs="Tahoma"/>
            ${bold}
            <w:color w:val="${settings.color}"/>
            <w:sz w:val="${settings.size}"/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(block.text)}</w:t>
        </w:r>
      </w:p>
    `;
  }

  function createDocxBlob(state) {
    const blocks = getDocumentTextBlocks(state);
    const paragraphs = blocks.map(createDocxParagraph).join("");
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          ${paragraphs}
          <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
          </w:sectPr>
        </w:body>
      </w:document>
    `;

    return createZipBlob([
      {
        name: "[Content_Types].xml",
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          </Types>
        `
      },
      {
        name: "_rels/.rels",
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
          </Relationships>
        `
      },
      {
        name: "word/document.xml",
        content: documentXml
      }
    ]);
  }

  function saveDocument(state) {
    if (state.kind !== "document") return;

    if (state.app === "notepad") {
      const blob = new Blob([getPlainTextContent(state)], { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, buildDownloadFileName(state, "txt"));
      return;
    }

    downloadBlob(createDocxBlob(state), buildDownloadFileName(state, "docx"));
  }

  function handleMenuCommand(state, command) {
    if (command === "save") {
      saveDocument(state);
    }
  }

  function buildDocumentShell({ id, title, app, locked = false }) {
    const isNotepad = app === "notepad";
    const menuMarkup = buildMenuBarMarkup(
      isNotepad
        ? ["File", "Edit", "Search", "Help"]
        : ["File", "Edit", "View", "Insert", "Format", "Tools", "Table", "Window", "Help"],
      {
        save: true,
        saveAs: false
      }
    );
    const titleIcon = isNotepad
      ? `<img class="title-icon title-app-icon small" src="${ICON_NOTEPAD_URL}" alt="" aria-hidden="true" />`
      : `<img class="title-icon title-app-icon small" src="${ICON_OFFICE_DOC_URL}" alt="" aria-hidden="true" />`;

    const contentMarkup = isNotepad
      ? `<pre class="document-content notepad-content">Loading...</pre>`
      : `<div class="document-content word-pages"></div>`;

    const statusMarkup = isNotepad
      ? `<div class="status-panel">Ln 1, Col 1</div>`
      : `<div class="status-panel page-indicator">Page 1 of 1</div><div class="status-panel">Sec 1</div><div class="status-panel">At 1&quot;</div>`;

    const win = document.createElement("section");
    win.className = `win98-window ${isNotepad ? "notepad" : "word"}${locked ? " locked-window" : ""}`;
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          ${titleIcon}
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">
            <img class="title-btn-icon" src="${ICON_MINIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn max-btn" aria-label="Maximize">
            <img class="title-btn-icon" src="${ICON_MAXIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn close-btn" aria-label="Close">
            <img class="title-btn-icon" src="${ICON_CLOSE_URL}" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      ${menuMarkup}

      ${
        isNotepad
          ? ""
          : `<div class="toolbar-row">
              <img class="toolbar-icon tiny" src="${ICON_NEW_DOCUMENT_URL}" alt="" aria-hidden="true" />
              <img class="toolbar-icon tiny" src="${ICON_OPEN_FOLDER_URL}" alt="" aria-hidden="true" />
              <img class="toolbar-icon tiny" src="${ICON_SAVE_URL}" alt="" aria-hidden="true" />
              <img class="toolbar-icon tiny" src="${ICON_PRINT_URL}" alt="" aria-hidden="true" />
            </div>`
      }

      <div class="document-area">${contentMarkup}</div>

      <div class="status-bar">${statusMarkup}</div>
    `;

    return win;
  }

  function buildExplorerShell({ id, title }) {
    const win = document.createElement("section");
    win.className = "win98-window explorer";
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          <img class="title-icon title-app-icon small" src="${ICON_FOLDER_16_URL}" alt="" aria-hidden="true" />
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">
            <img class="title-btn-icon" src="${ICON_MINIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn max-btn" aria-label="Maximize">
            <img class="title-btn-icon" src="${ICON_MAXIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn close-btn" aria-label="Close">
            <img class="title-btn-icon" src="${ICON_CLOSE_URL}" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      ${buildMenuBarMarkup(["File", "Edit", "View", "Go", "Favorites", "Help"])}

      <div class="toolbar-row explorer-toolbar">
        <span class="explorer-toolbar-label">Address:</span>
        <div class="explorer-address"></div>
      </div>

      <div class="document-area explorer-area">
        <div class="explorer-grid" role="list"></div>
      </div>

      <div class="status-bar">
        <div class="status-panel explorer-status">0 item(s)</div>
      </div>
    `;

    return win;
  }

  function buildFindShell({ id, title }) {
    const win = document.createElement("section");
    win.className = "win98-window find";
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          <img class="title-icon title-app-icon small" src="${ICON_FIND_URL}" alt="" aria-hidden="true" />
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">
            <img class="title-btn-icon" src="${ICON_MINIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn max-btn" aria-label="Maximize">
            <img class="title-btn-icon" src="${ICON_MAXIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn close-btn" aria-label="Close">
            <img class="title-btn-icon" src="${ICON_CLOSE_URL}" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      ${buildMenuBarMarkup(["File", "Edit", "Tools", "Help"])}

      <div class="toolbar-row find-toolbar">
        <label class="find-input-label" for="${id}-query">Containing text:</label>
        <input id="${id}-query" class="find-input" type="text" autocomplete="off" />
        <button class="find-run-btn" type="button">Find Now</button>
      </div>

      <div class="document-area find-area">
        <p class="find-empty">Type your query and click Find Now.</p>
        <ul class="find-results hidden"></ul>
      </div>

      <div class="status-bar">
        <div class="status-panel find-status">0 item(s)</div>
      </div>
    `;

    return win;
  }

  function createTaskButton(name, winId) {
    const btn = document.createElement("button");
    btn.className = "task-button";
    btn.textContent = name;
    btn.dataset.winId = winId;
    taskButtonsContainer.appendChild(btn);
    return btn;
  }

  function minimizeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.style.display = "none";
    state.minimized = true;
    if (state.taskBtn) {
      state.taskBtn.classList.remove("active-task");
    }
  }

  function restoreWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.style.display = "flex";
    state.minimized = false;
  }

  function setMaxButtonState(state, isMaximized) {
    const maxBtn = state.el.querySelector(".max-btn");
    if (!maxBtn) return;
    const iconEl = maxBtn.querySelector(".title-btn-icon");

    if (isMaximized) {
      maxBtn.setAttribute("aria-label", "Restore");
      if (iconEl) iconEl.setAttribute("src", ICON_RESTORE_URL);
      return;
    }

    maxBtn.setAttribute("aria-label", "Maximize");
    if (iconEl) iconEl.setAttribute("src", ICON_MAXIMIZE_URL);
  }

  function maximizeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state || state.maximized) return;

    state.restoreBounds = {
      left: state.el.style.left,
      top: state.el.style.top,
      width: state.el.style.width,
      height: state.el.style.height
    };

    fillWindowToDesktop(state.el);
    state.maximized = true;
    setMaxButtonState(state, true);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function restoreFromMaximized(winId) {
    const state = windowsMap.get(winId);
    if (!state || !state.maximized) return;

    const bounds = state.restoreBounds || {};
    state.el.style.left = bounds.left || "";
    state.el.style.top = bounds.top || "";
    state.el.style.width = bounds.width || "";
    state.el.style.height = bounds.height || "";
    state.maximized = false;
    state.restoreBounds = null;
    setMaxButtonState(state, false);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function toggleMaximized(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    if (state.maximized) {
      restoreFromMaximized(winId);
      return;
    }

    maximizeWindow(winId);
  }

  function closeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.remove();
    if (state.taskBtn) {
      state.taskBtn.remove();
    }
    windowsMap.delete(winId);

    let topState = null;
    windowsMap.forEach((winState) => {
      if (winState.minimized) return;
      if (!topState || Number(winState.el.style.zIndex) > Number(topState.el.style.zIndex)) {
        topState = winState;
      }
    });

    if (topState && topState.taskBtn) {
      topState.taskBtn.classList.add("active-task");
    }
  }

  function clampWindowPosition(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function startWindowDrag(state, event) {
    if (!state || state.maximized) return;
    if (event.button !== undefined && event.button !== 0) return;
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (eventTarget && eventTarget.closest(".title-buttons")) return;
    if (typeof event.clientX !== "number" || typeof event.clientY !== "number") return;

    event.preventDefault();
    bringToFront(state.id);

    const titleBar = event.currentTarget;
    const layerBounds = windowsLayer.getBoundingClientRect();
    const windowBounds = state.el.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = windowBounds.left - layerBounds.left;
    const startTop = windowBounds.top - layerBounds.top;
    const maxLeft = Math.max(0, layerBounds.width - windowBounds.width);
    const maxTop = Math.max(0, layerBounds.height - windowBounds.height);

    state.el.classList.add("is-dragging");

    if (titleBar.setPointerCapture && event.pointerId !== undefined) {
      try {
        titleBar.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail if the pointer is no longer active.
      }
    }

    const onPointerMove = (moveEvent) => {
      if (typeof moveEvent.clientX !== "number" || typeof moveEvent.clientY !== "number") return;

      const nextLeft = clampWindowPosition(startLeft + moveEvent.clientX - startX, 0, maxLeft);
      const nextTop = clampWindowPosition(startTop + moveEvent.clientY - startY, 0, maxTop);
      state.el.style.left = `${Math.round(nextLeft)}px`;
      state.el.style.top = `${Math.round(nextTop)}px`;
    };

    const stopDragging = (endEvent) => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", stopDragging);
      document.removeEventListener("pointercancel", stopDragging);
      state.el.classList.remove("is-dragging");

      if (titleBar.releasePointerCapture && endEvent.pointerId !== undefined) {
        try {
          titleBar.releasePointerCapture(endEvent.pointerId);
        } catch {
          // The browser may have already released capture on cancel/up.
        }
      }
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopDragging);
    document.addEventListener("pointercancel", stopDragging);
  }

  function attachWindowEvents(state) {
    const { id, el, locked, taskBtn } = state;

    bringToFront(id);
    el.addEventListener("mousedown", () => bringToFront(id));

    const minBtn = el.querySelector(".min-btn");
    const maxBtn = el.querySelector(".max-btn");
    const closeBtn = el.querySelector(".close-btn");
    const titleBar = el.querySelector(".title-bar");
    const menuBar = el.querySelector(".menu-bar");

    titleBar.addEventListener("pointerdown", (event) => {
      startWindowDrag(state, event);
    });

    if (menuBar) {
      menuBar.addEventListener("click", (event) => {
        const eventTarget = event.target instanceof Element ? event.target : null;
        const commandButton = eventTarget
          ? eventTarget.closest(".menu-command[data-command]")
          : null;
        if (!commandButton || commandButton.disabled) return;
        event.preventDefault();
        handleMenuCommand(state, commandButton.dataset.command);
      });
    }

    if (!locked) {
      minBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        minimizeWindow(id);
      });

      maxBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMaximized(id);
        bringToFront(id);
      });

      closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        closeWindow(id);
      });

      titleBar.addEventListener("dblclick", () => {
        toggleMaximized(id);
        bringToFront(id);
      });
    }

    if (taskBtn) {
      taskBtn.addEventListener("click", () => {
        const windowState = windowsMap.get(id);
        if (!windowState || windowState.locked) return;

        if (windowState.minimized) {
          restoreWindow(id);
          bringToFront(id);
          return;
        }

        const isActive = taskBtn.classList.contains("active-task");
        if (isActive) {
          minimizeWindow(id);
        } else {
          bringToFront(id);
        }
      });
    }
  }

  function applyFullscreen(state) {
    fillWindowToDesktop(state.el);
    state.maximized = true;
    setMaxButtonState(state, true);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function restoreAndFocus(state) {
    if (state.minimized) {
      restoreWindow(state.id);
    }
    bringToFront(state.id);
  }

  function findExistingDocument(file, app) {
    for (const state of windowsMap.values()) {
      if (state.kind !== "document") continue;
      if (state.file === file && state.app === app) {
        return state;
      }
    }
    return null;
  }

  function getExplorerIconUrl(type) {
    if (type === "folder") return ICON_FOLDER_32_URL;
    if (type === "doc") return ICON_OFFICE_DOC_32_URL;
    if (type === "txt") return ICON_NOTEPAD_URL;
    if (type === "jpeg" || type === "png") return ICON_GENERIC_FILE_32_URL;
    if (type === "mp3") return ICON_GENERIC_FILE_32_URL;
    if (type === "mpeg") return ICON_GENERIC_FILE_32_URL;
    if (type === "file") return ICON_GENERIC_FILE_32_URL;
    return ICON_GENERIC_FILE_32_URL;
  }

  function isExplorerItemOpenable(item) {
    if (!item) return false;
    if (item.type === "folder") return true;
    if (item.type === "doc") return true;
    if (item.type === "txt") return true;
    return !UNSUPPORTED_EXPLORER_TYPES.has(item.type);
  }

  function renderExplorerItems(state) {
    const grid = state.el.querySelector(".explorer-grid");
    const status = state.el.querySelector(".explorer-status");
    const addressEl = state.el.querySelector(".explorer-address");
    if (!grid || !status || !addressEl) return;

    const items = Array.isArray(state.items) ? state.items : [];

    grid.innerHTML = "";
    addressEl.textContent = state.folderPath ? `My Documents\\${state.folderPath.replaceAll("/", "\\")}` : "My Documents";

    items.forEach((item) => {
      const entryBtn = document.createElement("button");
      const openable = isExplorerItemOpenable(item);
      entryBtn.type = "button";
      entryBtn.className = `explorer-item${openable ? "" : " is-disabled"}`;
      entryBtn.dataset.entryPath = item.path || "";
      entryBtn.dataset.entryType = item.type || "file";

      const icon = document.createElement("img");
      icon.className = "icon-image explorer-item-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("alt", "");
      icon.setAttribute("src", getExplorerIconUrl(item.type));

      const label = document.createElement("span");
      label.className = "explorer-item-label";
      label.textContent = item.title || "Item";

      entryBtn.appendChild(icon);
      entryBtn.appendChild(label);

      entryBtn.addEventListener("click", () => {
        state.selectedEntryPath = item.path || "";
        const allEntries = grid.querySelectorAll(".explorer-item");
        allEntries.forEach((el) => el.classList.remove("is-selected"));
        entryBtn.classList.add("is-selected");
      });

      entryBtn.addEventListener("dblclick", () => {
        if (!openable) return;
        if (typeof state.onOpenItem !== "function") return;
        state.onOpenItem(item);
      });

      grid.appendChild(entryBtn);
    });

    if (items.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "explorer-empty";
      emptyState.textContent = "This folder is empty.";
      grid.appendChild(emptyState);
    }

    status.textContent = `${items.length} item(s)`;
  }

  function findExistingExplorer(folderPath) {
    const normalizedFolderPath = normalizeFolderPath(folderPath);

    for (const state of windowsMap.values()) {
      if (state.kind !== "explorer") continue;
      if (normalizeFolderPath(state.folderPath) === normalizedFolderPath) {
        return state;
      }
    }

    return null;
  }

  function findExistingWindowByKind(kind) {
    for (const state of windowsMap.values()) {
      if (state.kind === kind) {
        return state;
      }
    }
    return null;
  }

  function renderFindResults(state) {
    const resultsEl = state.el.querySelector(".find-results");
    const emptyEl = state.el.querySelector(".find-empty");
    const statusEl = state.el.querySelector(".find-status");
    if (!resultsEl || !emptyEl || !statusEl) return;

    const results = Array.isArray(state.results) ? state.results : [];
    resultsEl.innerHTML = "";

    if (results.length === 0) {
      resultsEl.classList.add("hidden");
      emptyEl.classList.remove("hidden");
      emptyEl.textContent = state.lastQuery
        ? "No items matched your query."
        : "Type your query and click Find Now.";
      statusEl.textContent = "0 item(s)";
      return;
    }

    emptyEl.classList.add("hidden");
    resultsEl.classList.remove("hidden");

    results.forEach((node) => {
      const openable = isExplorerItemOpenable(node);

      const row = document.createElement("li");
      row.className = "find-result-row";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `find-result-btn${openable ? "" : " is-disabled"}`;
      btn.dataset.path = node.path || "";

      const icon = document.createElement("img");
      icon.className = "find-result-icon";
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.src = getExplorerIconUrl(node.type);

      const textWrap = document.createElement("span");
      textWrap.className = "find-result-text";

      const title = document.createElement("span");
      title.className = "find-result-title";
      title.textContent = node.title || "Item";

      const meta = document.createElement("span");
      meta.className = "find-result-meta";
      meta.textContent = `${node.type || "file"} • ${node.path || "root"}`;

      textWrap.appendChild(title);
      textWrap.appendChild(meta);
      btn.appendChild(icon);
      btn.appendChild(textWrap);

      btn.addEventListener("click", () => {
        state.selectedResultPath = node.path || "";
        resultsEl.querySelectorAll(".find-result-btn").forEach((item) => {
          item.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
      });

      btn.addEventListener("dblclick", () => {
        if (!openable || typeof state.onOpenResult !== "function") return;
        state.onOpenResult(node);
      });

      row.appendChild(btn);
      resultsEl.appendChild(row);
    });

    statusEl.textContent = `${results.length} item(s)`;
  }

  function attachFindInteractions(state) {
    const queryInput = state.el.querySelector(".find-input");
    const runButton = state.el.querySelector(".find-run-btn");
    if (!queryInput || !runButton) return;

    const runSearch = async () => {
      if (typeof state.onSearch !== "function") return;

      const query = queryInput.value.trim();
      state.lastQuery = query;
      state.selectedResultPath = "";

      const token = (state.searchToken || 0) + 1;
      state.searchToken = token;

      const results = await Promise.resolve(state.onSearch(query));
      if (token !== state.searchToken) return;

      state.results = Array.isArray(results) ? results : [];
      renderFindResults(state);
    };

    runButton.addEventListener("click", runSearch);

    queryInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSearch();
      }
    });

    queryInput.focus();
  }

  async function openDocument({
    name,
    title,
    file,
    app,
    fullscreen = false,
    locked = false,
    createTaskbarButton = true
  }) {
    const existing = findExistingDocument(file, app);
    if (existing) {
      restoreAndFocus(existing);
      return existing.id;
    }

    const id = `win-${++winCounter}`;

    const winEl = buildDocumentShell({ id, title, app, locked });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskbarButton ? createTaskButton(name, id) : null;

    const state = {
      id,
      kind: "document",
      name,
      title,
      file,
      app,
      fullscreen,
      el: winEl,
      taskBtn,
      locked,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      sourceText: "",
      wordSourceHtml: null,
      wordLayout: null,
      wordScrollHandler: null
    };
    windowsMap.set(id, state);

    const contentEl = winEl.querySelector(".document-content");
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      const raw = await response.text();
      state.sourceText = raw;

      if (app === "notepad") {
        contentEl.textContent = raw;
      } else {
        state.wordSourceHtml = raw;
        renderWordDocument(state);
      }
    } catch (error) {
      state.sourceText = `Error\n\nCould not load ${file}\n${error.message}`;
      if (app === "notepad") {
        contentEl.textContent = state.sourceText;
      } else {
        state.wordSourceHtml = `
          <h1>Error</h1>
          <p>Could not load <strong>${file}</strong>.</p>
          <p>${error.message}</p>
        `;
        renderWordDocument(state);
      }
    }

    attachWindowEvents(state);

    if (fullscreen) {
      applyFullscreen(state);
    }

    return id;
  }

  function openExplorer({
    name,
    title,
    folderPath = "",
    items = [],
    onOpenItem,
    createTaskbarButton = true
  }) {
    const normalizedFolderPath = normalizeFolderPath(folderPath);
    const existing = findExistingExplorer(normalizedFolderPath);

    if (existing) {
      existing.items = Array.isArray(items) ? items : [];
      existing.onOpenItem = onOpenItem;
      existing.title = title;
      existing.name = name;
      const titleEl = existing.el.querySelector(".window-title-text");
      if (titleEl) {
        titleEl.textContent = title;
      }
      if (existing.taskBtn) {
        existing.taskBtn.textContent = name;
      }
      renderExplorerItems(existing);
      restoreAndFocus(existing);
      return existing.id;
    }

    const id = `win-${++winCounter}`;

    const winEl = buildExplorerShell({ id, title });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskbarButton ? createTaskButton(name, id) : null;

    const state = {
      id,
      kind: "explorer",
      name,
      title,
      app: "explorer",
      folderPath: normalizedFolderPath,
      items: Array.isArray(items) ? items : [],
      onOpenItem,
      el: winEl,
      taskBtn,
      locked: false,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      selectedEntryPath: ""
    };

    windowsMap.set(id, state);
    renderExplorerItems(state);
    attachWindowEvents(state);

    return id;
  }

  function openFind({
    name = "Find",
    title = "Find",
    onSearch,
    onOpenResult,
    createTaskbarButton = true
  }) {
    const existing = findExistingWindowByKind("find");
    if (existing) {
      existing.onSearch = onSearch;
      existing.onOpenResult = onOpenResult;
      existing.name = name;
      existing.title = title;

      const titleEl = existing.el.querySelector(".window-title-text");
      if (titleEl) {
        titleEl.textContent = title;
      }
      if (existing.taskBtn) {
        existing.taskBtn.textContent = name;
      }

      restoreAndFocus(existing);
      const queryInput = existing.el.querySelector(".find-input");
      if (queryInput) {
        queryInput.focus();
        queryInput.select();
      }
      return existing.id;
    }

    const id = `win-${++winCounter}`;

    const winEl = buildFindShell({ id, title });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskbarButton ? createTaskButton(name, id) : null;

    const state = {
      id,
      kind: "find",
      name,
      title,
      app: "find",
      el: winEl,
      taskBtn,
      locked: false,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      onSearch,
      onOpenResult,
      results: [],
      lastQuery: "",
      selectedResultPath: "",
      searchToken: 0
    };

    windowsMap.set(id, state);
    renderFindResults(state);
    attachWindowEvents(state);
    attachFindInteractions(state);

    return id;
  }

  window.addEventListener("resize", () => {
    windowsMap.forEach((state) => {
      if (state.maximized) {
        fillWindowToDesktop(state.el);
      }

      if (shouldRenderWord(state) && state.wordSourceHtml) {
        renderWordDocument(state);
      }
    });
  });

  return {
    openDocument,
    openExplorer,
    openFind
  };
}
