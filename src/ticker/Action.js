/*
    this code is literally just stolen from the Pixi.js ticker library because im a lazy asshole
    you can see the original code here: https://github.com/pixijs/pixi.js/blob/dev/src/core/ticker/Ticker.js
    their license (MIT) states that we have to include this copyright notice, so here it is:

    The MIT License

    Copyright (c) 2013-2017 Mathew Groves, Chad Engler

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */

export default class Action
{
    /**
     * Constructor
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} [context=null] - The listener context
     * @param {number} [priority=0] - The priority for emitting
     * @param {boolean} [once=false] - If the handler should fire once
     */
    constructor(fn, context = null, priority = 0, once = false)
    {
        /**
         * The handler function to execute.
         * @member {Function}
         */
        this.fn = fn;

        /**
         * The calling to execute.
         * @member {Function}
         */
        this.context = context;

        /**
         * The current priority.
         * @member {number}
         */
        this.priority = priority;

        /**
         * If this should only execute once.
         * @member {boolean}
         */
        this.once = once;

        /**
         * The next item in chain.
         * @member {TickerListener}
         */
        this.next = null;

        /**
         * The previous item in chain.
         * @member {TickerListener}
         */
        this.previous = null;

        /**
         * `true` if this listener has been destroyed already.
         * @member {boolean}
         * @private
         */
        this._destroyed = false;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @return {boolean} `true` if the listener match the arguments
     */
    match(fn, context)
    {
        context = context || null;

        return this.fn === fn && this.context === context;
    }

    /**
     * Emit by calling the current function.
     * @param {number} deltaTime - time since the last emit.
     * @return {TickerListener} Next ticker
     */
    emit(deltaTime)
    {
        if (this.fn)
        {
            if (this.context)
            {
                this.fn.call(this.context, deltaTime);
            }
            else
            {
                this.fn(deltaTime);
            }
        }

        const redirect = this.next;

        if (this.once)
        {
            this.destroy(true);
        }

        // Soft-destroying should remove
        // the next reference
        if (this._destroyed)
        {
            this.next = null;
        }

        return redirect;
    }

    /**
     * Connect to the list.
     * @param {TickerListener} previous - Input node, previous listener
     */
    connect(previous)
    {
        this.previous = previous;
        if (previous.next)
        {
            previous.next.previous = this;
        }
        this.next = previous.next;
        previous.next = this;
    }

    /**
     * Destroy and don't use after this.
     * @param {boolean} [hard = false] `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @return {TickerListener} The listener to redirect while emitting or removing.
     */
    destroy(hard = false)
    {
        this._destroyed = true;
        this.fn = null;
        this.context = null;

        // Disconnect, hook up next and previous
        if (this.previous)
        {
            this.previous.next = this.next;
        }

        if (this.next)
        {
            this.next.previous = this.previous;
        }

        // Redirect to the next item
        const redirect = this.next;

        // Remove references
        this.next = hard ? null : redirect;
        this.previous = null;

        return redirect;
    }
}