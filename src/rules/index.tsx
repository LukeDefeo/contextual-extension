import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Rules from './Rules';
import './Rules.css'
import {normalize} from "csstips";
import {setupPage} from "csstips";

normalize();
setupPage('#root');

chrome.tabs.query({active: true, currentWindow: true}, tab => {
  ReactDOM.render(<Rules/>, document.getElementById('root'));
});

