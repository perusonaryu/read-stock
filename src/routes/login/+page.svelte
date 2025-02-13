<script lang="ts">
	import { supabase } from '$lib';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');

	async function signIn() {
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			errorMessage = error.message;
		} else {
			goto('/');
		}
	}
</script>

<form onsubmit={signIn}>
	<input type="email" bind:value={email} placeholder="メールアドレス" required />
	<input type="password" bind:value={password} placeholder="パスワード" required />
	<button type="submit">ログイン</button>
</form>

{#if errorMessage}
	<p style="color: red;">{errorMessage}</p>
{/if}
