"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supportedLanguages = void 0;

var _enLocale = _interopRequireDefault(require("./localization/enLocale"));

var _zhCNLocale = _interopRequireDefault(require("./localization/zhCNLocale"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var supportedLanguages = {
  en: _enLocale["default"],
  zh_CN: _zhCNLocale["default"]
};
exports.supportedLanguages = supportedLanguages;