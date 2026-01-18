<template>
  <div class="editor-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="router.back()" class="edit-toggle" id="back">◄ Go Back</button>
      <div class="left-buttons">
        <button class="edit-toggle" @click="toggleOverlay">Edit Sections</button>
        <button class="save-btn" @click="saveTemplate">Save Changes</button>
      </div>
    </div>

    <!-- Edit Overlay -->
    <transition name="slide-fade">
      <div v-if="showOverlay" class="edit-overlay">
        <div class="overlay-sidebar">
          <!-- Header -->
          <div class="overlay-header">
            <h3>Edit Content</h3>
            <button class="close-btn" @click="toggleOverlay">×</button>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button :class="{ active: currentTab === 'text' }" @click="currentTab = 'text'">
              Text Sections
            </button>
            <button :class="{ active: currentTab === 'image' }" @click="currentTab = 'image'">
              Image Sections
            </button>
          </div>

          <!-- Section Lists -->
          <div class="section-list">
            <!-- Text Sections -->
            <div v-if="currentTab === 'text'">
              <div v-if="textSections.length === 0" class="no-sections-message">
                No editable text sections found in this template.
              </div>
              <div v-for="(section, index) in textSections" :key="section.id || `text-${index}`" class="section-item">
                <label>{{ section.name }}</label>
                <div class="section-input wysiwyg-editor" contenteditable="true"
                  @input="updateFromDiv($event, section)" v-html="section.content"></div>
                <p class="preview-label">Preview:</p>
                <div class="section-preview" v-html="section.content"></div>
              </div>
            </div>

            <!-- Image Sections -->
            <div v-if="currentTab === 'image'">
              <div v-if="imageSections.length === 0" class="no-sections-message">
                No editable image sections found in this template.
              </div>
              <div v-for="(section, index) in imageSections" :key="section.id || `image-${index}`" class="section-item">
                <label>{{ section.name }}</label>

                <div class="image-edit-controls">
                  <label :for="`file-upload-${section.id || index}`" class="file-upload-label button-like">
                    Click To Upload New Image
                  </label>
                  <input :id="`file-upload-${section.id || index}`" type="file" @change="uploadImage($event, section)" accept="image/*" class="file-input-hidden" />
                  
                  <label>Or enter Image URL:</label>
                  <input type="text" v-model="section.src" @input="updateImageSource(section)"
                    placeholder="Enter image URL" class="image-url-input" />
                </div>

                <div class="image-preview" v-if="section.src">
                  <p class="preview-label">Current Image:</p>
                  <img :src="section.src" alt="Image preview" />
                </div>
                <div v-else class="no-image-preview">
                  No image selected or URL provided.
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="overlay-footer">
            <button class="save-btn" @click="saveTemplate">Save Changes</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Iframe Preview -->
    <div class="preview-wrapper">
      <iframe v-if="templateHtml" ref="previewIframe" :srcdoc="templateHtml" @load="onIframeLoad" class="preview-frame"
        id="preview-frame"></iframe>
      <div v-else class="loading-template">Loading template preview...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchCsrfToken } from "@/utils/csrf";
import { useAlertStore } from "@/stores/alert";

const BACKEND_BASE = import.meta.env.VITE_API_URL;

const alert = useAlertStore();
const route = useRoute();
const router = useRouter();

const edited_template_id = route?.params?.editedtemplate_id;

const showOverlay = ref(false);
const templateHtml = ref('');
const previewIframe = ref(null);
const sections = ref([]);
const currentTab = ref('text');

const textSections = computed(() =>
  sections.value.filter((s) => s.type === 'text')
);

const imageSections = computed(() =>
  sections.value.filter((s) => s.type === 'image')
);

// Toggle overlay visibility
const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value;
};

// Fetch template HTML content by ID
const fetchEditedTemplate = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/editedTemplates/${edited_template_id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Template fetch failed");
    const data = await res.json();
    templateHtml.value = data.html_content;
  } catch (err) {
    alert.show("Failed to load template: " + err.message, "error");
    templateHtml.value = `<p>Error: ${err.message}</p>`;
  }
};

// Extract editable sections once iframe loads
const onIframeLoad = () => {
  const iframeDoc = previewIframe.value?.contentDocument;
  if (!iframeDoc) return;

  const editableElements = iframeDoc.querySelectorAll("[data-editable='true'], [data-editable-image='true']");

  sections.value = Array.from(editableElements).map((el, i) => {
    if (el.hasAttribute("data-editable-image")) {
      return {
        id: el.id || `image-${i}`,
        name: el.dataset.editableName || el.alt || "Editable Image",
        type: "image",
        src: el.src,
        element: el,
      };
    } else {
      return {
        id: el.id || `text-${i}`,
        name: el.dataset.editableName || "Editable Text",
        type: "text",
        content: el.innerHTML.trim(),
        element: el,
      };
    }
  });
};

// Live update from contentEditable div
const updateFromDiv = (event, section) => {
  const el = event.target;
  const caretPos = saveCaretPosition(el);
  section.content = el.innerHTML;
  updateSectionContent(section);
  requestAnimationFrame(() => restoreCaretPosition(el, caretPos));
};

const updateImageSource = (section) => {
  if (section.element) section.element.src = section.src;
};

const updateSectionContent = (section) => {
  if (!section.element) return;
  if (section.type === "text") {
    section.element.innerHTML = section.content;
  } else if (section.type === "image") {
    section.element.src = section.src;
  }
};

// Upload new image for an image section
const uploadImage = async (event, section) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("Image", file);
  const csrfToken = await fetchCsrfToken();

  try {
    const response = await fetch(`${BACKEND_BASE}/api/upload-image`, {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      body: formData,
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      section.src = data.url;
      updateImageSource(section);
    } else {
      alert.show("Image upload failed: " + data.message, "error");
    }
  } catch (err) {
    alert.show("Image upload error: " + err.message, "error");
  }
};

// Save final content
const saveTemplate = async () => {
  const iframeDoc = previewIframe.value?.contentDocument;
  const editor = iframeDoc?.querySelector("#editor");

  if (!editor) {
    alert.show("Editor not found!", "error");
    return;
  }

  try {
    const updatedContent = editor.innerHTML;
    const csrfToken = await fetchCsrfToken();

    const res = await fetch(`${BACKEND_BASE}/api/edited_templates/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        edited_template_id,
        content: updatedContent,
      }),
    });

    if (res.status === 200) {
      alert.show("Template saved successfully!", "success");
      router.push("/dashboard/myTemplates");
    } else {
      alert.show("Failed to save template", "error");
    }
  } catch (err) {
    alert.show("Save failed: " + err.message, "error");
  }
};

// Caret save & restore functions
function saveCaretPosition(el) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(el);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  return preSelectionRange.toString().length;
}

function restoreCaretPosition(el, pos) {
  const selection = window.getSelection();
  const range = document.createRange();
  let charIndex = 0;
  let foundStart = false;

  const nodeStack = [el];
  let node;
  while ((node = nodeStack.pop()) && !foundStart) {
    if (node.nodeType === 3) {
      const nextCharIndex = charIndex + node.length;
      if (pos >= charIndex && pos <= nextCharIndex) {
        range.setStart(node, pos - charIndex);
        range.collapse(true);
        foundStart = true;
        break;
      }
      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  if (foundStart) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Auth check on load
onMounted(async () => {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/check-session`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!data.logged_in) {
      alert.show("Log in first", "error");
      router.push("/login");
    } else {
      await fetchEditedTemplate();
    }
  } catch (err) {
    alert.show("Error verifying session", "error");
    router.push("/login");
  }
});
</script>




































<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5; /* off-white */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #eaeaea;
  border-bottom: 1px solid #ccc;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.left-buttons {
  display: flex;
  gap: 0.8rem;
}

.edit-toggle,
.save-btn {
  padding: 0.5rem 1rem;
  background-color: #d6d6d6;
  color: #222;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.edit-toggle:hover,
.save-btn:hover {
  background-color: #c2c2c2;
}

/* Overlay */
.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  animation: slide-in 0.3s ease-out forwards;
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ececec;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

.close-btn {
  background: none;
  font-size: 1.4rem;
  border: none;
  cursor: pointer;
  color: #666;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-around;
  background-color: #f0f0f0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ccc;
}
.tabs button {
  background: none;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}
.tabs button.active {
  border-bottom: 2px solid #666;
  color: #222;
}

/* Section List */
.section-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.section-item {
  margin-bottom: 1.2rem;
}
.section-item label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}
.section-input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 80px;
  background-color: #fefefe;
  margin-bottom: 0.5rem;
}
.section-preview {
  background-color: #f9f9f9;
  border: 1px dashed #ccc;
  border-radius: 6px;
  padding: 0.5rem;
}
.preview-label {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
}

/* Image Upload */
.image-edit-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.file-upload-label.button-like {
  background-color: #ddd;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  display: inline-block;
  cursor: pointer;
}
.file-input-hidden {
  display: none;
}
.image-url-input {
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.image-preview img {
  max-width: 100%;
  border-radius: 6px;
  margin-top: 0.5rem;
}
.no-image-preview {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
}

/* Footer */
.overlay-footer {
  padding: 1rem;
  border-top: 1px solid #ccc;
  background-color: #f2f2f2;
  text-align: center;
}

/* Iframe Preview */
.preview-wrapper {
  flex: 1;
  background-color: #f0f0f0;
  position: relative;
}
.preview-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.loading-template {
  padding: 2rem;
  text-align: center;
  color: #999;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

</style>