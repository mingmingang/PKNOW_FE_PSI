import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { useState, useEffect, useRef } from "react";

export default function Editor({
  id,
  value,
  onChange,
  onEditorChange,
  disabled,
}) {
  const [ready, setReady] = useState(false);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const editorId = id || `editor-${Math.random().toString(36).substr(2, 9)}`;
  const toolbarId = `toolbar-${editorId}`;

  useEffect(() => {
    setReady(true);

    return () => {
      if (toolbarRef.current) {
        toolbarRef.current.innerHTML = "";
      }
    };
  }, []);

  const handleEditorReady = (editor) => {
    editorRef.current = editor;

    const toolbarContainer = document.querySelector(`#${toolbarId}`);

    if (toolbarContainer && editor.ui.view.toolbar.element) {
      toolbarContainer.innerHTML = "";
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);

      toolbarRef.current = toolbarContainer;
    }
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();

    if (onChange) {
      onChange(data);
    }
    if (onEditorChange) {
      onEditorChange(data);
    }
  };

  const handleEditorDestroy = () => {
    if (toolbarRef.current) {
      toolbarRef.current.innerHTML = "";
    }
    editorRef.current = null;
  };

  if (!DecoupledEditor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="editor-container">
      <div
        id={toolbarId}
        className="editor-toolbar"
        ref={toolbarRef}
        style={{
          border: "1px solid #ccc",
          borderBottom: "none",
          borderRadius: "4px 4px 0 0",
          padding: "5px",
          backgroundColor: "#f8f9fa",
        }}
      />
      <div
        className="editor-content"
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          minHeight: "100%",
        }}
      >
        <CKEditor
          editor={DecoupledEditor}
          data={value || ""}
          disabled={disabled}
          onReady={handleEditorReady}
          onChange={handleEditorChange}
          onDestroy={handleEditorDestroy}
        />
      </div>
    </div>
  );
}
