/**
 * @module Tip
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('nd-jquery');
var Template = require('nd-template');

var Core = require('./src/core');

// 依赖样式 alice/poptip@1.1.1
// require('./tip.css');

// 气泡提示弹出组件
// ---
var Tip = Core.extend({

  Implements: Template,

  attrs: {
    template: require('./src/tip.handlebars'),

    // 提示内容
    content: 'A TIP BOX',

    // 统一样式前缀
    classPrefix: 'ui-tip',

    // 箭头位置
    // 按钟表点位置，目前支持1、2、5、7、10、11点位置
    // https://i.alipayobjects.com/e/201307/jBty06lQT.png
    arrowPosition: 7,

    align: {
      setter: function (val) {
        // 用户初始化时主动设置了 align
        // 且并非来自 arrowPosition 的设置
        if (val && !val.comeFromArrowPosition) {
          this._specifiedAlign = true;
        }
        return val;
      }
    },

    // 颜色 [yellow|blue|white]
    theme: null,

    // 当弹出层显示在屏幕外时，是否自动转换浮层位置
    inViewport: false
  },

  setup: function () {
    Core.superclass.setup.call(this);
    this._originArrowPosition = this.get('arrowPosition');

    this.after('show', function () {
      this._makesureInViewport();
    });
  },

  _makesureInViewport: function () {
    if (!this.get('inViewport')) {
      return;
    }
    var ap = '' + this._originArrowPosition,
      scrollTop = $(window).scrollTop(),
      scrollLeft = $(window).scrollLeft(),
      viewportHeight = $(window).outerHeight(),
      viewportWidth = $(window).outerWidth(),
      elemHeight = this.element.height() + this.get('distance'),
      elemWidth = this.element.width() + this.get('distance'),
      triggerTop = this.get('trigger').offset().top,
      triggerLeft = this.get('trigger').offset().left,
      triggerHeight = this.get('trigger').height(),
      triggerWidth = this.get('trigger').width(),
      widthMap = {
        '10': '2',
        '2': '10',
        '1': '11',
        '11': '1',
        '7': '5',
        '5': '7'
      },
      heightMap = {
        '1': '5',
        '5': '1',
        '7': '11',
        '11': '7'
      }
    if ((ap === '10'||ap === '7' || ap === '11') && (triggerLeft + triggerWidth > scrollLeft + viewportWidth - elemWidth)) {
      // tip 溢出屏幕右边
      ap = widthMap[ap]
    } else if (( ap === '1' || ap === '5' || ap === '2') && (triggerLeft < scrollLeft + elemWidth)) {
      // tip 溢出屏幕左边
      ap = widthMap[ap]
    }

    if ((ap === '11' || ap === '1') && (triggerTop + triggerHeight > scrollTop + viewportHeight - elemHeight)) {
      // tip 溢出屏幕下方
      ap = heightMap[ap]
    } else if ((ap === '7' || ap === '5') && (triggerTop < scrollTop + elemHeight)) {
      // tip 溢出屏幕上方
      ap = heightMap[ap]
    }


    this.set('arrowPosition', +ap);
  },

  // 用于 set 属性后的界面更新
  _onRenderArrowPosition: function (val, prev) {
    val = parseInt(val, 10);
    var arrow = this.$('[data-role=arrow]');
    arrow.removeClass(this.get('classPrefix') + '-arrow-' + prev).addClass(this.get('classPrefix') + '-arrow-' + val);

    // 用户设置了 align
    // 则直接使用 align 表示的位置信息，忽略 arrowPosition
    if (this._specifiedAlign) {
      return;
    }

    var direction = '',
        arrowShift = 0;
    if (val === 10) {
      direction = 'right';
      arrowShift = 20;
    }
    else if (val === 11) {
      direction = 'down';
      arrowShift = 22;
    }
    else if (val === 1) {
      direction = 'down';
      arrowShift = -22;
    }
    else if (val === 2) {
      direction = 'left';
      arrowShift = 20;
    }
    else if (val === 5) {
      direction = 'up';
      arrowShift = -22;
    }
    else if (val === 7) {
      direction = 'up';
      arrowShift = 22;
    }
    this.set('direction', direction);
    this.set('arrowShift', arrowShift);
    this._setAlign();
  },

  _onRenderWidth: function (val) {
    this.$('[data-role="content"]').css('width', val);
  },

  _onRenderHeight: function (val) {
    this.$('[data-role="content"]').css('height', val);
  },

  _onRenderTheme: function (val, prev) {
    this.element.removeClass('ui-poptip-' + prev);
    this.element.addClass('ui-poptip-' + val);
  }

});

module.exports = Tip;
