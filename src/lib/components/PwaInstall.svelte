<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// インストールプロンプトを保存する変数
	let deferredPrompt: any;
	let showInstallButton = $state(false);

	onMount(() => {
		// beforeinstallpromptイベントをキャプチャ
		window.addEventListener('beforeinstallprompt', (e) => {
			// デフォルトのプロンプト表示を防止
			e.preventDefault();
			// イベントを保存
			deferredPrompt = e;
			// インストールボタンを表示
			showInstallButton = true;
		});

		// インストール完了イベント
		window.addEventListener('appinstalled', () => {
			console.log('アプリがインストールされました');
			showInstallButton = false;
			deferredPrompt = null;
		});
	});

	// インストールを促す関数
	async function installPwa() {
		if (!deferredPrompt) return;

		// インストールプロンプトを表示
		deferredPrompt.prompt();

		// ユーザーの選択を待つ
		const { outcome } = await deferredPrompt.userChoice;
		console.log(`インストール結果: ${outcome}`);

		// deferredPromptはもう使えないのでリセット
		deferredPrompt = null;
		showInstallButton = false;
	}
</script>

{#if showInstallButton}
	<div
		class="fixed bottom-4 left-4 z-50 rounded-lg bg-white p-4 shadow-lg"
		transition:fade={{ duration: 300 }}
	>
		<p class="mb-2 font-medium">Read Stackをインストール</p>
		<p class="mb-3 text-sm text-gray-600">ホーム画面に追加してより快適に利用できます</p>
		<div class="flex gap-2">
			<button
				class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				on:click={installPwa}
			>
				インストール
			</button>
			<button
				class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
				on:click={() => (showInstallButton = false)}
			>
				後で
			</button>
		</div>
	</div>
{/if}
