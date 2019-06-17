import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Rules from './Rules';

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
  ReactDOM.render(<Rules />, document.getElementById('rules'));
});