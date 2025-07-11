import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'reactstrap';
import Editor from '../../cell-editors/tags-editor';
import DeleteTag from '../../cell-editors/tags-editor/delete-tags';
import { getRowById } from '../../../../components/sf-table/utils/table';
import { getRecordIdFromRecord } from '../../../utils/cell';
import { gettext } from '../../../../utils/constants';
import { KeyCodes } from '../../../../constants';
import { getEventClassName } from '../../../../utils/dom';
import { useTags } from '../../../../tag/hooks';

import './index.css';

const TagsEditor = ({ record, value, field, updateFileTags }) => {
  const ref = useRef(null);

  const [showEditor, setShowEditor] = useState(false);

  const { tagsData, context } = useTags();
  const canEditData = useMemo(() => window.sfMetadataContext && window.sfMetadataContext.canModifyRow() || false, []);

  const validValue = useMemo(() => {
    if (!Array.isArray(value) || value.length === 0) return [];
    return value.filter(item => getRowById(tagsData, item.row_id)).map(item => item.row_id);
  }, [value, tagsData]);

  const onClick = useCallback((event) => {
    if (!event.target) return;
    const className = getEventClassName(event);
    if (className.indexOf('sf-metadata-search-tags') > -1) return;
    const dom = document.querySelector('.sf-metadata-tags-editor');
    if (!dom) return;
    if (dom.contains(event.target)) return;
    if (ref.current && !ref.current.contains(event.target) && showEditor) {
      setShowEditor(false);
    }
  }, [showEditor]);

  const onHotKey = useCallback((event) => {
    if (event.keyCode === KeyCodes.Esc) {
      if (showEditor) {
        setShowEditor(false);
      }
    }
  }, [showEditor]);

  useEffect(() => {
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onHotKey, true);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onHotKey, true);
    };
  }, [onClick, onHotKey]);

  const openEditor = useCallback(() => {
    setShowEditor(true);
  }, []);

  const onDeleteTag = useCallback((tagId, event) => {
    event && event.stopPropagation();
    event && event.nativeEvent && event.nativeEvent.stopImmediatePropagation();
    const newValue = validValue.slice(0);
    let optionIdx = validValue.indexOf(tagId);
    if (optionIdx > -1) {
      newValue.splice(optionIdx, 1);
    }
    const recordId = getRecordIdFromRecord(record);
    updateFileTags([{ record_id: recordId, tags: newValue, old_tags: Array.isArray(value) ? value.map(i => i.row_id) : [] }]);
  }, [validValue, value, record, updateFileTags]);

  const onSelectTag = useCallback((tagId) => {
    const recordId = getRecordIdFromRecord(record);
    const newValue = validValue.slice(0);
    if (!newValue.includes(tagId)) {
      newValue.push(tagId);
    }
    updateFileTags([{ record_id: recordId, tags: newValue, old_tags: Array.isArray(value) ? value.map(i => i.row_id) : [] }]);
  }, [record, value, validValue, updateFileTags]);

  const onDeselectTag = useCallback((tagId) => {
    const recordId = getRecordIdFromRecord(record);
    const newValue = validValue.slice(0);
    let optionIdx = validValue.indexOf(tagId);
    if (optionIdx > -1) {
      newValue.splice(optionIdx, 1);
    }
    updateFileTags([{ record_id: recordId, tags: newValue, old_tags: Array.isArray(value) ? value.map(i => i.row_id) : [] }]);
  }, [record, value, validValue, updateFileTags]);

  const renderEditor = useCallback(() => {
    if (!showEditor) return null;
    const { width, top, bottom } = ref.current.getBoundingClientRect();
    const editorHeight = 400;
    const viewportHeight = window.innerHeight;
    let placement = 'bottom-end';
    if (viewportHeight - bottom < editorHeight && top > editorHeight) {
      placement = 'top-end';
    } else if (viewportHeight - bottom < editorHeight && top < editorHeight) {
      placement = 'left-start';
    }

    return (
      <Popover
        target={ref}
        isOpen={true}
        placement={placement}
        hideArrow={true}
        fade={false}
        className="sf-metadata-property-editor-popover sf-metadata-tags-property-editor-popover"
        boundariesElement="viewport"
      >
        <Editor
          saveImmediately={true}
          value={value}
          column={{ ...field, width: Math.max(width - 2, 400) }}
          onSelect={onSelectTag}
          onDeselect={onDeselectTag}
          canEditData={canEditData}
          canAddTag={context.canAddTag()}
        />
      </Popover>
    );
  }, [showEditor, field, value, context, canEditData, onSelectTag, onDeselectTag]);

  return (
    <div
      className="sf-metadata-property-detail-editor sf-metadata-tags-property-detail-editor"
      placeholder={gettext('Empty')}
      ref={ref}
      onClick={openEditor}
    >
      {validValue.length > 0 && (<DeleteTag value={validValue} tags={tagsData} onDelete={onDeleteTag} />)}
      {renderEditor()}
    </div>
  );

};

TagsEditor.propTypes = {
  record: PropTypes.object,
  value: PropTypes.array,
  field: PropTypes.object,
  updateFileTags: PropTypes.func,
};

export default TagsEditor;
