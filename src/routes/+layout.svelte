<script>
	import '../app.scss';
</script>

<svelte:head>
	<title>Dr Wong</title>
</svelte:head>

<nav class="navbar navbar-dark navbar-expand-lg bg-primary">
	<div class="container">
		<a class="navbar-brand" href="/">Dr Wong</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link active" aria-current="page" href="/">Home</a>
				</li>
			</ul>
		</div>
	</div>
</nav>
<slot />
