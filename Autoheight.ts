/**
 * WP Editor Autoheight
 *
 * Automatically adjusts the height of all textareas and WP Editor iframe instances based on their content.
 * This functionality also applies to textareas and editors that are added dynamically, such as in ACF Flexible Content.
 *
 * Author: Arne Prescher
 * Website: https://arne.love
 * Version: 1.0.0
 * Tested up to: 6.5.3
 * License: MIT
 */
 
export default class Autoheight {
	iframes: HTMLIFrameElement[]
	textareas: HTMLTextAreaElement[]

	getInterval: NodeJS.Timeout
	minHeight = 100 // set your preferred minimum height for editors and textareas here

	constructor() {
		this.iframes = []
		this.textareas = []
	}

	init() {
		// initially get all wysiwygs
		setTimeout(() => this.getWysiwygs(), 300)

		// get all wysiwygs every second to check for new ones (e.g. when adding a new block in ACF Flexible Content)
		this.getInterval = setInterval(() => this.getWysiwygs(), 1000)

		// when wysiwygs are loaded, the ln-autoheight-loaded event is dispatched.
		// let's catch this event to add the watcher functionality to all iframes and textareas
		document.addEventListener('ln-autoheight-loaded', () => {
			// little delay is needed to make sure all iframe.contentDocument.body are available
			setTimeout(() => {
				// watch for resize on all iframes
				this.iframes.forEach(iframe => {
					// add ResizeObserver only to new iframes that are not already observed
					if (!iframe.dataset.autoheight) {
						new ResizeObserver(() => this.updateIframe(iframe)).observe(iframe.contentDocument.body)
						iframe.dataset.autoheight = 'true'
					}
				})

				// watch for resize on all textareas
				this.textareas.forEach(textarea => {
					// watch only new textareas that are not already observed
					if (!textarea.dataset.autoheight) {
						// set initial height
						textarea.removeAttribute('rows')
						textarea.style.overflowY = 'hidden'
						this.updateTextarea(textarea)
						// watch for input event to update height if needed
						addEventListener('input', () => this.updateTextarea(textarea))
						textarea.dataset.autoheight = 'true'
					}
				})
			}, 100)
		})
	}

	/**
	 * Push all wysiwygs and textareas to this.iframes and this.textareas and dispatch ln-autoheight-loaded event
	 */
	getWysiwygs(): void {
		const iframes: NodeListOf<HTMLIFrameElement> = document.querySelectorAll('#wpwrap .wp-editor-wrap iframe')
		const textareas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll('#wpwrap textarea:not([disabled])')

		if (iframes.length > 0) {
			iframes.forEach(iframe => {
				// push to this.iframes if not already in there
				if (!this.iframes.includes(iframe)) {
					this.iframes.push(iframe)
				}
			})
		}

		if (textareas.length > 0) {
			textareas.forEach(textarea => {
				// push to this.textareas if not already in there
				if (!this.textareas.includes(textarea)) {
					this.textareas.push(textarea)
				}
			})
		}

		document.dispatchEvent(new CustomEvent('ln-autoheight-loaded', {}))
	}

	/**
	 * Update the height of an iframe
	 */
	updateIframe(iframe: HTMLIFrameElement): void {
		const height = iframe.contentDocument.body.scrollHeight > this.minHeight ? iframe.contentDocument.body.scrollHeight : this.minHeight
		iframe.style.height = height + 40 + 'px' // 40px is the bottom space of the iframe
	}

	/**
	 * Update the height of a textarea
	 */
	updateTextarea(textarea: HTMLTextAreaElement): void {
		textarea.style.height = 'auto'
		const height = textarea.scrollHeight > this.minHeight ? textarea.scrollHeight : this.minHeight
		textarea.style.height = height + 'px'
	}
}