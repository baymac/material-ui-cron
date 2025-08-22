"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SchedulerRoot;

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _Scheduler = _interopRequireDefault(require("./Scheduler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function SchedulerRoot(props) {
  return _react["default"].createElement(_recoil.RecoilRoot, null, _react["default"].createElement(_Scheduler["default"], props));
}