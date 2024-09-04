import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Tag, Switch } from 'antd';
import classNames from 'classnames';
import styles from './index.module.less';
import { Build, search_build } from '@/config/data';

interface Props {
  start: Build | undefined;
  finish: Build | undefined;
  changeStart: (node: Build) => void;
  changeFinish: (node: Build) => void;
  findPath: () => void;
  switchTagsShow: () => void;
  distance: number;
}

const OperateBorad: React.FC<Props> = ({
  start,
  finish,
  changeStart,
  changeFinish,
  findPath,
  switchTagsShow,
  distance,
}) => {
  const [startOptions, setStartOptions] = useState<Build[]>([]);
  const [finishOptions, setFinishOptions] = useState<Build[]>([]);
  const [isFindBtnShaked, setIsFindBtnShaked] = useState<boolean>(false);
  const handleFindPath = () => {
    if (start && finish && start.name !== finish.name) {
      findPath();
    } else {
      setIsFindBtnShaked(true);
      setTimeout(() => {
        setIsFindBtnShaked(false);
      }, 200);
    }
  };

  // 模糊搜索
  const handleSearch = (type: 0 | 1, value: string) => {
    let kw = value.trim();
    if (!kw) return;
    const res = search_build(kw);
    if (type === 0) {
      setStartOptions(res);
    } else {
      setFinishOptions(res);
    }
  };

  // 选中
  const handleSelect = (type: 0 | 1, label: string) => {
    let node;
    if (type === 0) {
      startOptions.forEach((item) => {
        if (label === item.name) {
          node = item;
        }
      });
      changeStart(node!);
    } else {
      finishOptions.forEach((item) => {
        if (label === item.name) {
          node = item;
        }
      });
      changeFinish(node!);
    }
  };

  return (
    <>
      {/* 顶部操作栏 */}
      {/* <div className={styles.routeBox}>
        <div className={styles.routeboxInputs}>
          <Select
            className={styles.startSelect}
            style={{ width: 200 }}
            showSearch
            value={start && start.name}
            placeholder="Masuk dan pilih titik awal"
            defaultActiveFirstOption={true}
            suffixIcon={null}
            onSearch={(value) => handleSearch(0, value)}
            onSelect={(label) => {
              handleSelect(0, label);
            }}
            notFoundContent={null}
            options={(startOptions || []).map((d) => ({
              value: d.name,
              label: d.name,
            }))}
          />
          <span className={styles.divideLine}>—</span>
          <Select
            className={styles.finishSelect}
            style={{ width: 200 }}
            showSearch
            value={finish && finish.name}
            placeholder="Masuk dan pilih titik akhir"
            defaultActiveFirstOption={true}
            suffixIcon={null}
            onSearch={(value) => handleSearch(1, value)}
            onSelect={(label) => {
              handleSelect(1, label);
            }}
            notFoundContent={null}
            options={(finishOptions || []).map((d) => ({
              value: d.name,
              label: d.name,
            }))}
          />
          <Button
            className={classNames(styles.findPathBtn, isFindBtnShaked && styles.shake)}
            onClick={handleFindPath}
            size="middle"
            type="primary"
          >
            Mulailah menemukan jalan Anda
          </Button>
          {distance && (
            <Tag className={styles.tag} color="blue">
              {distance}m 约{Math.ceil(distance / (1.1 * 60))}Menit
            </Tag>
          )}
        </div>
      </div>
      <Switch
        className={styles.tagsControl}
        checkedChildren="Label ditampilkan"
        unCheckedChildren="Label ditutupkan"
        defaultChecked
        onChange={switchTagsShow}
      /> */}
    </>
  );
};

export default OperateBorad;
