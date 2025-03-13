<script lang="ts">
	let { size }: { size?: 'sm' | 'md' | 'lg' } = $props();

	let sizeClass = $derived(size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-10 w-10' : 'h-15 w-15');
</script>

<div
	class={`animate-spin rounded-full border-3 border-sky-600 border-t-transparent ${sizeClass}`}
></div>
