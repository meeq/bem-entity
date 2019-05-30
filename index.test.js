var chai = require('chai')
var sinon = require('sinon')
var expect = chai.expect

chai.use(require('sinon-chai'))

var BemEntity = require('./index')

describe('shared/bem', function () {

  describe('utility methods', function () {

    describe('joinClasses', function () {
      it('returns a string of space-separated class names in CLASSNAME_MODE', function () {
        expect(BemEntity.joinClasses(['a', 'b', 'c'], BemEntity.CLASSNAME_MODE))
        .to.equal('a b c')
        expect(BemEntity.joinClasses(['a'], BemEntity.CLASSNAME_MODE))
        .to.equal('a')
        expect(BemEntity.joinClasses([], BemEntity.CLASSNAME_MODE))
        .to.equal('')
      })

      it('returns a single CSS selector targeting multiple class names in SELECTOR_MODE', function () {
        expect(BemEntity.joinClasses(['a', 'b', 'c'], BemEntity.SELECTOR_MODE))
        .to.equal('.a.b.c')
        expect(BemEntity.joinClasses(['a'], BemEntity.SELECTOR_MODE))
        .to.equal('.a')
        expect(BemEntity.joinClasses([], BemEntity.SELECTOR_MODE))
        .to.equal('')
      })
    })

    describe('composeElement', function () {
      it('joins a BEM block to a BEM element with the element token separator', function () {
        expect(BemEntity.composeElement('block', 'element'))
        .to.equal('block__element')
      })
    })

    describe('composeModifier', function () {
      it('joins a BEM block (or block element) to a BEM modifier with the modifier token separator', function () {
        expect(BemEntity.composeModifier('block', 'modifier'))
        .to.equal('block--modifier')
        expect(BemEntity.composeModifier('block__element', 'modifier'))
        .to.equal('block__element--modifier')
      })
    })

    describe('squashModifiersObject', function () {
      it('Converts modifiers object into array of `key`/`key-value`/null', function () {
        expect(BemEntity.squashModifiersObject({
          1: 2, // Number indexes always come first in Object.keys
          'key': 'value',
          'zero_value': 0,
          'on_true': true,
          'on_empty_string': '',
          'off_false': false,
          'off_null': null,
          'off_undefined': undefined
        }))
        .to.deep.equal([
          '1-2',
          'key-value',
          'zero_value-0',
          'on_true',
          'on_empty_string',
          null,
          null,
          null
        ])
        expect(BemEntity.squashModifiersObject({}))
        .to.be.an('array').that.is.empty
      })
    })

    describe('parseModifiers', function () {
      it('Converts modifiers string into array', function () {
        expect(BemEntity.parseModifiers('mod1 mod2-val mod3'))
        .to.deep.equal(['mod1', 'mod2-val', 'mod3'])
        expect(BemEntity.parseModifiers('mod1'))
        .to.deep.equal(['mod1'])
        expect(BemEntity.parseModifiers(''))
        .to.be.an('array').that.is.empty
      })

      it('Converts modifiers object into array', function () {
        expect(BemEntity.parseModifiers({
          1: 2, // Number indexes always come first in Object.keys
          'key': 'value',
          'zero_value': 0,
          'on_true': true,
          'on_empty_string': '',
          'off_false': false,
          'off_null': null,
          'off_undefined': undefined
        }))
        .to.deep.equal([
          '1-2',
          'key-value',
          'zero_value-0',
          'on_true',
          'on_empty_string'
        ])
        expect(BemEntity.parseModifiers({}))
        .to.be.an('array').that.is.empty
      })

      it('Prunes negatory modifiers (except zero) from array', function () {
        expect(BemEntity.parseModifiers([
          'key-value',
          'flag',
          0,
          1,
          '',
          false,
          null,
          undefined
        ]))
        .to.deep.equal(['key-value', 'flag', 0, 1])
        expect(BemEntity.parseModifiers([]))
        .to.be.an('array').that.is.empty
      })
    })

    describe('composeModifiers', function () {
      it('Returns the base in an array if there are no parsed modifiers', function () {
        expect(BemEntity.composeModifiers('block', ''))
        .to.deep.equal(['block'])
        expect(BemEntity.composeModifiers('block__elem', {}))
        .to.deep.equal(['block__elem'])
        expect(BemEntity.composeModifiers('block', []))
        .to.deep.equal(['block'])
        expect(BemEntity.composeModifiers('block__elem', ['', false, null, undefined]))
        .to.deep.equal(['block__elem'])
        expect(BemEntity.composeModifiers('block', {
          'off_false': false,
          'off_null': null,
          'off_undefined': undefined
        }))
        .to.deep.equal(['block'])
      })

      it('Joins a BEM block (or block element) with parsed BEM modifiers', function () {
        expect(BemEntity.composeModifiers('block', 'key-value   flag 0      1'))
        .to.deep.equal([
          'block',
          'block--key-value',
          'block--flag',
          'block--0',
          'block--1'
        ])
        expect(BemEntity.composeModifiers('block__elem', ['key-value', 'flag', 0, 1]))
        .to.deep.equal([
          'block__elem',
          'block__elem--key-value',
          'block__elem--flag',
          'block__elem--0',
          'block__elem--1'
        ])
        expect(BemEntity.composeModifiers('block', {
          // Number indexes always come first in Object.keys
          0: true,
          1: 2,
          key: 'value',
          flag: true
        }))
        .to.deep.equal([
          'block',
          'block--0',
          'block--1-2',
          'block--key-value',
          'block--flag'
        ])
      })
    })

  })

  describe('static methods', function () {
    describe('block', function () {
      it('Returns a className from a BEM block and parsed modifiers', function () {
        expect(BemEntity.block('block', 'key-value flag', BemEntity.CLASSNAME_MODE))
        .to.equal('block block--key-value block--flag')
        expect(BemEntity.block('block', { key: 'value', flag: true }, BemEntity.CLASSNAME_MODE))
        .to.equal('block block--key-value block--flag')
        expect(BemEntity.block('block', '', BemEntity.CLASSNAME_MODE))
        .to.equal('block')
      })

      it('Returns a CSS selector from a BEM block and parsed modifiers', function () {
        expect(BemEntity.block('block', ['key-value', 'flag'], BemEntity.SELECTOR_MODE))
        .to.equal('.block.block--key-value.block--flag')
        expect(BemEntity.block('block', 'mod', BemEntity.SELECTOR_MODE))
        .to.equal('.block.block--mod')
        expect(BemEntity.block('block', [], BemEntity.SELECTOR_MODE))
        .to.equal('.block')
      })
    })

    describe('element', function () {
      it('Returns a className from a BEM block, element and parsed modifiers', function () {
        expect(BemEntity.element('block', 'element', 'key-value flag', BemEntity.CLASSNAME_MODE))
        .to.equal('block__element block__element--key-value block__element--flag')
        expect(BemEntity.element('block', 'element', { key: 'value', flag: true }, BemEntity.CLASSNAME_MODE))
        .to.equal('block__element block__element--key-value block__element--flag')
        expect(BemEntity.element('block', 'element', '', BemEntity.CLASSNAME_MODE))
        .to.equal('block__element')
      })

      it('Returns a CSS selector from a BEM block, element and parsed modifiers', function () {
        expect(BemEntity.element('block', 'element', ['key-value', 'flag'], BemEntity.SELECTOR_MODE))
        .to.equal('.block__element.block__element--key-value.block__element--flag')
        expect(BemEntity.element('block', 'element', [], BemEntity.SELECTOR_MODE))
        .to.equal('.block__element')
      })
    })

    describe('convenience methods', function () {
      beforeEach(function () {
        sinon.spy(BemEntity, 'block')
        sinon.spy(BemEntity, 'element')
      })

      afterEach(function () {
        BemEntity.block.restore()
        BemEntity.element.restore()
      })

      describe('blockClassName', function () {
        it('calls `block` with CLASSNAME_MODE', function () {
          expect(BemEntity.blockClassName('block', 'mod'))
          .to.equal('block block--mod')
          expect(BemEntity.block)
          .to.have.been.calledOnceWith('block', 'mod', BemEntity.CLASSNAME_MODE)
        })
      })

      describe('blockSelector', function () {
        it('calls `block` with SELECTOR_MODE', function () {
          expect(BemEntity.blockSelector('block', 'mod'))
          .to.equal('.block.block--mod')
          expect(BemEntity.block)
          .to.have.been.calledOnceWith('block', 'mod', BemEntity.SELECTOR_MODE)
        })
      })

      describe('elementClassName', function () {
        it('calls `element` with CLASSNAME_MODE', function () {
          expect(BemEntity.elementClassName('block', 'element', 'mod'))
          .to.equal('block__element block__element--mod')
          expect(BemEntity.element)
          .to.have.been.calledOnceWith('block', 'element', 'mod', BemEntity.CLASSNAME_MODE)
        })
      })

      describe('elementSelector', function () {
        it('calls `element` with SELECTOR_MODE', function () {
          expect(BemEntity.elementSelector('block', 'element', 'mod'))
          .to.equal('.block__element.block__element--mod')
          expect(BemEntity.element)
          .to.have.been.calledOnceWith('block', 'element', 'mod', BemEntity.SELECTOR_MODE)
        })
      })
    })
  })

  describe('instance methods', function () {

    describe('preferredMode methods', function () {
      describe('block', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'block')
        })

        afterEach(function () {
          BemEntity.block.restore()
        })

        it('calls static `block` method with instance variables', function () {
          var entity = BemEntity('block', BemEntity.CLASSNAME_MODE)
          expect(entity.block('mod'))
          .to.equal('block block--mod')
          expect(BemEntity.block)
          .to.have.been.calledOnceWith('block', 'mod', BemEntity.CLASSNAME_MODE)
        })
      })

      describe('element', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'element')
        })

        afterEach(function () {
          BemEntity.element.restore()
        })

        it('calls static `element` method with instance variables', function () {
          var entity = BemEntity('block', BemEntity.SELECTOR_MODE)
          expect(entity.element('element', 'mod'))
          .to.equal('.block__element.block__element--mod')
          expect(BemEntity.element)
          .to.have.been.calledOnceWith('block', 'element', 'mod', BemEntity.SELECTOR_MODE)
        })
      })
    })

    describe('non-preferredMode convenience methods', function () {
      describe('blockClassName', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'blockClassName')
        })

        afterEach(function () {
          BemEntity.blockClassName.restore()
        })

        it('calls static `blockClassName` method with instance block name and ignores preferredMode', function () {
          var entity = BemEntity('block', BemEntity.SELECTOR_MODE)
          expect(entity.blockClassName('mod'))
          .to.equal('block block--mod')
          expect(BemEntity.blockClassName)
          .to.have.been.calledOnceWith('block', 'mod')
        })
      })

      describe('blockSelector', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'blockSelector')
        })

        afterEach(function () {
          BemEntity.blockSelector.restore()
        })

        it('calls static `blockSelector` method with instance block name and ignores preferredMode', function () {
          var entity = BemEntity('block', BemEntity.CLASSNAME_MODE)
          expect(entity.blockSelector('mod'))
          .to.equal('.block.block--mod')
          expect(BemEntity.blockSelector)
          .to.have.been.calledOnceWith('block', 'mod')
        })
      })

      describe('elementClassName', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'elementClassName')
        })

        afterEach(function () {
          BemEntity.elementClassName.restore()
        })

        it('calls static `elementClassName` method with instance block name and ignores preferredMode', function () {
          var entity = BemEntity('block', BemEntity.SELECTOR_MODE)
          expect(entity.elementClassName('element', 'mod'))
          .to.equal('block__element block__element--mod')
          expect(BemEntity.elementClassName)
          .to.have.been.calledOnceWith('block', 'element', 'mod')
        })
      })

      describe('elementSelector', function () {
        beforeEach(function () {
          sinon.spy(BemEntity, 'elementSelector')
        })

        afterEach(function () {
          BemEntity.elementSelector.restore()
        })

        it('calls static `elementSelector` method with instance block name and ignores preferredMode', function () {
          var entity = BemEntity('block', BemEntity.CLASSNAME_MODE)
          expect(entity.elementSelector('element', 'mod'))
          .to.equal('.block__element.block__element--mod')
          expect(BemEntity.elementSelector)
          .to.have.been.calledOnceWith('block', 'element', 'mod')
        })
      })
    })
  })
})
