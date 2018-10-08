/**
 * This file declares a class that represents a Text element in a  table.
 * @module VisualCell
 */

import {
    selectElement,
    makeElement,
    getSmartComputedStyle,
    generateGetterSetters
} from 'muze-utils';
import SimpleCell from './simple-cell';
import { TEXT } from './enums/cell-type';
import { PROPS } from './props';
import { DEFAULT_CONFIG } from './enums/defaults';
import { CLASSPREFIX, TOP, BOTTOM, LEFT, RIGHT, HEADER, WIDTH, TEXT_CELL } from './enums/constants';
import './text-cell.scss';

/**
* Computes the Logical Space for the text
*
* @param {Object} context Required to get the needed parameters to compute text space
* @return {Object} Logical space taken up by text
* @memberof TextCell
*/
const computeTextSpace = (context) => {
    const { labelManager } = context.dependencies();
    const { _minSpacing, _minTextSpace } = context;
    const {
       margin,
       show,
       maxLines
   } = context.config();
    const {
       left,
       right,
       top,
       bottom
    } = margin;
    const paddedHeight = top + bottom + _minSpacing.height;
    const paddedWidth = left + right + _minSpacing.width;
    const availHeight = context.availHeight() - paddedWidth;
    const availWidth = context.availWidth() - paddedHeight;
    const source = context.source();

    labelManager.setStyle(context._computedStyle);

    context.smartText(labelManager.getSmartText(source, availWidth, availHeight, false));
    const space = context.smartText();

    if (space.width > (availWidth || 0) && maxLines) {
        space.height = space.oriTextHeight * maxLines;
    }
    if (!availWidth) {
        space.width = _minTextSpace.width;
    }
    if (show) {
        return {
            width: space.width + paddedWidth,
            height: space.height + paddedHeight
        };
    } return {
        width: 0,
        height: 0
    };
};

/**
 * Represents a table haeder.
 *
 * @class Text
 */
class TextCell extends SimpleCell {

    /**
     * Creates an instance of Text.
     * @param {Object} config The input configuration.
     * @param {string} dependencies Dependencies for the class(labelManager)
     * @memberof Text
     */
    constructor (config, dependencies) {
        super(config);

        this._dependencies = dependencies;
        this._className = this._config.className ||
                    (this._config.type === HEADER ? `${CLASSPREFIX}-${HEADER}-cell` : `${CLASSPREFIX}-${TEXT}-cell`);
        this._computedStyle = getSmartComputedStyle(selectElement('body'), this._className);
        this._dependencies.labelManager.setStyle(this._computedStyle);
        this._minSpacing = this._dependencies.labelManager.getOriSize('wv');
        this._minTextSpace = this._dependencies.labelManager.getOriSize('WWW');

        generateGetterSetters(this, PROPS[TEXT]);
    }

    /**
     * return the type pf SimpleCell cell.
     *
     * @readonly
     * @memberof TextCell
     */
    get type () {
        return TEXT;
    }

    /**
     * This method return the value contained by this SimpleCell.
     *
     * @return {string} The text value contained by this cell.
     * @memberof TextCell
     */
    valueOf () {
        return this.source();
    }

    /**
     * This method is used to return a unique identifier for
     * the Text cell.
     *
     * @return {string} The unique identifier for the Text.
     * @memberof TextCell
     */
    get id () {
        return this._id;
    }

    /**
     * Returns the dependencies of the instance
     *
     * @return {Object} Dependencies needed by the class
     * @memberof TextCell
     */
    dependencies () {
        return this._dependencies;
    }

    /**
     * This method is used to obtain a serialized representation of this instance.
     *
     * @return {Object} Object with serilizable props.
     * @memberof TextCell
     */
    serialize () {
        return {
            text: this.source(),
            type: TEXT
        };
    }

    /**
     * return the default configuration for the text cell
     *
     * @static
     * @return {Object} Default configuration of the cell
     * @memberof TextCell
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     * This method return the space taken up
     * by the text with the style applied.
     *
     * @return {Object} width and height taken up by the text.
     * @memberof Text
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(computeTextSpace(this));
        }
        return this.logicalSpace();
    }

    /**
     * This method is used to set the available space.
     *
     * @param {number} width The available width.
     * @param {number} height The available height.
     * @return {Instance} Returns current Instance
     * @memberof TextCell
     */
    setAvailableSpace (width, height) {
        this.availWidth(width);
        this.availHeight(height);
        this.logicalSpace(computeTextSpace(this));
        return this;
    }

    /**
     * This method is used to render the Text cell inside
     * the provided mount point.
     *
     * @param {HTMLElement} mount The mount point for this cell.
     * @return {Instance} Returns current Instance
     * @memberof Text
     */
    render (mount) {
        const availWidth = this.availWidth();
        const {
            margin,
            show,
            verticalAlign,
            textAlign
        } = this.config();

        this.mount(mount);
        if (show) {
            const container = selectElement(mount);
            const elem = makeElement(container, 'div', [this.id], `${CLASSPREFIX}-${TEXT_CELL}`);

            container.style('vertical-align', verticalAlign);
            elem.classed(this._className, true);
            // apply style on the returned element
            elem.style(WIDTH, availWidth ? `${availWidth}px` : '100%');
            [TOP, BOTTOM, LEFT, RIGHT].forEach((type) => {
                elem.style(`padding-${type}`, `${margin[type]}px`);
            });
            elem.style('text-align', textAlign);
            elem.style('display', 'inline');

            // set the text as the innerHTML
            elem.html(this.smartText().text);
        }
        return this;
    }

    /**
     * Disposes the cell
     *
     * @return {Instance} Returns current Instance
     * @memberof TextCell
     */
    remove () {
        this.mount() && this.mount().remove();
        return this;
    }
 }

export default TextCell;
