import './App.less';
import React, { useEffect, useRef, useState } from 'react';
import SchoolCanvas from '@/components/schoolCanvas';
import OperateBorad from './components/operateBorad';
import { Build } from './config/data';
import AsideButton from '@/components/asideButton';
import { CSSTransition } from 'react-transition-group';
import icon_first from '@/resources/images/first.svg';
import icon_resetCamera from '@/resources/images/reset.svg';
import icon_god from '@/resources/images/god.svg';
import loadBMap from '@/utils/loadBMap';
import loadAMap from '@/utils/loadAMap';

interface LL {
  longitude: number;
  latitude: number;
}

const App: React.FC = () => {
  const [start, setStart] = useState<Build>();
  const [finish, setFinish] = useState<Build>();
  const [controlType, setControlType] = useState<'first' | 'god'>('god');
  const [sceneReady, setSceneReady] = useState<boolean>(false);
  const [location, setLocation] = useState<LL>({ longitude: 0, latitude: 0 });
  const [tagsShow, setTagsShow] = useState<boolean>(true);
  const [BMapLoaded, setBMapLoaded] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>();

  // ref untuk SchoolCanvas (pakai any biar gampang panggil method publiknya)
  const school = useRef<any>(null);

  // ref khusus untuk CSSTransition (WAJIB di React 19)
  const transitionRef = useRef<HTMLDivElement | null>(null);

  const findPath = () => {
    school.current?.resetNavigation();
    const len = school.current?.startFindPath(start, finish);
    if (len) setDistance(len);
  };

  // Switch POV
  const handlelChangeControl = () => {
    if (controlType === 'first') {
      setControlType('god');
      school.current?.setControls('god');
    } else {
      setControlType('first');
      school.current?.setControls('first');
    }
  };

  // Reset camera
  const handlelResetCamera = () => {
    school.current?.initCamera(1500);
  };

  const switchTagsShow = (checked: boolean) => setTagsShow(checked);

  return (
    <div className="SCNU">
      {/* School view */}
      <SchoolCanvas
        ref={school}
        controlType={controlType}
        sceneReady={sceneReady}
        setSceneReady={setSceneReady}
        location={location}
        tagsShow={tagsShow}
      />

      {/* Penting: gunakan nodeRef + child harus 1 elemen DOM dengan ref yang sama */}
      <CSSTransition
        in={sceneReady}
        timeout={800}
        nodeRef={transitionRef}
        classNames={{
          enter: 'alert-enter',
          enterActive: 'alert-enter-active',
          // opsional jika kamu punya kelas exit:
          exit: 'alert-exit',
          exitActive: 'alert-exit-active',
        }}
        unmountOnExit
      >
        <div ref={transitionRef}>
          {/* Operate Panel */}
          <OperateBorad
            start={start}
            finish={finish}
            changeStart={setStart}
            changeFinish={setFinish}
            findPath={findPath}
            switchTagsShow={switchTagsShow}
            distance={distance}
          />

          {/* Aside buttons */}
          <div className="asideBtns">
            {/* 
            <AsideButton
              clickSth={handlelChangeControl}
              btn_value={controlType === 'first' ? 'Sky POV' : 'Eye POV'}
              btn_icon={controlType === 'first' ? icon_god : icon_first}
            />
            */}
            {controlType === 'god' && (
              <AsideButton
                clickSth={handlelResetCamera}
                btn_value={'Cam Reset'}
                btn_icon={icon_resetCamera}
              />
            )}
          </div>

          {/* (opsional) link/credit */}
          {/* ... */}
        </div>
      </CSSTransition>
    </div>
  );
};

export default App;
