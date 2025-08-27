import { GUI } from 'dat.gui';

let gui = new GUI();
let debugObject = {};

function createGUI() {
  if (gui)
    return gui;
  gui = new GUI();
  return gui;
}

function clearGUI() {
  gui.destroy();
  gui = null;
  debugObject = {};
}

export { clearGUI, createGUI, debugObject, gui };
