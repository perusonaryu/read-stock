declare module '@jamescoyle/svelte-icon' {
	import type { SvelteComponentTyped } from 'svelte';

	export interface SvgIconProps {
		type: string;
		path: string;
		size?: string | number;
		viewbox?: string;
		flip?: null | 'horizontal' | 'vertical';
		rotate?: `${number}deg`;
	}

	export default class SvgIcon extends SvelteComponentTyped<SvgIconProps> {}
}
