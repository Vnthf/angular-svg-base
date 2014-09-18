'use strict';

describe('svgAttrs', function() {
  describe('html5Mode', function() {
    var basePath, baseTag;

    beforeEach(function() {
      module('ngSVGAttributes', function($locationProvider) {
        $locationProvider.html5Mode(true);
      });
    });


    it('should do nothing if no url()', inject(function($compile, $rootScope) {
      var element = $compile('<svg><ellipse clip-path="#someNonUrl"></ellipse></svg>')($rootScope);
      $rootScope.$digest();
      expect(element.children(0).attr('clip-path')).toBe('#someNonUrl');
    }));


    it('should only apply to svg elements', inject(function($rootScope, $compile, urlResolve) {
      var basePath = urlResolve('resources').href;
      var template = '<div><span clip-path="url(#foo)"></span></div>';
      var element = $compile(template)($rootScope);
      $rootScope.$digest();
      expect(element.html()).toContain('clip-path="url(#foo)"');
      expect(element.html()).not.toContain(basePath);
    }));


    it('should make hash relative to current path in html5mode', function() {
      inject(function($compile, $rootScope, $location) {
        $location.path('/mypath');
        var template = [
          '<svg>',
            '<ellipse clip-path="url(#my-clip)"></ellipse>',
          '</svg>'
        ].join('');
        var element = $compile(template)($rootScope);
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(http://server/mypath#my-clip)');
      });
    });


    it('should work if there is another hash in absUrl()', function() {
      inject(function($compile, $rootScope, $location) {
        $location.path('/mypath');
        $location.hash('someHash');
        var template = [
          '<svg>',
            '<ellipse clip-path="url(#my-clip)"></ellipse>',
          '</svg>'
        ].join('');
        var element = $compile(template)($rootScope);
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(http://server/mypath#my-clip)');
      });
    });


    it('should update url on $locationChangeSuccess event in html5mode', function() {
      inject(function($compile, $rootScope, $location) {
        var element;

        var template = [
          '<svg>',
            '<ellipse clip-path="url(#my-clip)"></ellipse>',
          '</svg>'
        ].join('');
        element = $compile(template)($rootScope);
        $location.path('/mypath');
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(http://server/mypath#my-clip)');
        $location.path('/newpath');
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(http://server/newpath#my-clip)');

      });
    });


    it('should do nothing with urls of different origins',
        inject(function($compile, $rootScope, $location) {
          var element = $compile([
            '<svg>',
              '<ellipse clip-path="url(http://google.com/logo.svg)"></ellipse>',
            '</svg>'
          ].join(''))($rootScope);
          $rootScope.$digest();
          expect(element.children(0).attr('clip-path')).toBe('url(http://google.com/logo.svg)');
        }));


    it('should do nothing with urls of different origins also in html5Mode', function() {
      inject(function($compile, $rootScope, $location) {
        var element = $compile(
            '<svg><ellipse clip-path="url(http://google.com/logo.svg#clipPath)"></ellipse></svg>')($rootScope);
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(http://google.com/logo.svg#clipPath)');
      });
    });


    it('should do nothing if $sniffer.history is falsy', function() {
      inject(function($compile, $rootScope, $location, $sniffer) {
        $sniffer.history = false;
        var element = $compile('<svg><ellipse clip-path="url(#someHash)"></ellipse></svg>')($rootScope);
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(#someHash)');
      });
    });
  });

  describe('non-html5Mode', function() {
    beforeEach(module('ngSVGAttributes'));
    it('should ignore attributes when not in html5mode', function() {
      inject(function($compile, $rootScope, $location) {
        var element;

        var template = [
          '<svg>',
            '<ellipse clip-path="url(#my-clip)"></ellipse>',
          '</svg>'
        ].join('');
        element = $compile(template)($rootScope);
        $location.path('/mypath');
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(#my-clip)');
        $location.path('/newpath');
        $rootScope.$digest();
        expect(element.children(0).attr('clip-path')).toBe('url(#my-clip)');
      });
    });
  })
});
