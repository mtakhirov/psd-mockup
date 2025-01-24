<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    AspectRatio,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
  } from "$lib";

  let worker: Worker;

  let clientName: string = "";

  async function initWebWorker() {
    if (!browser || !window.Worker) return;

    const Worker = await import("$lib/workers/psd.worker?worker");

    worker = new Worker.default();
    worker.onmessage = function (e: MessageEvent) {
      const { status, message } = e.data;
      console.log(status, message);
    };
  }

  function terminateWebWorker() {
    if (!worker) return;
    worker.terminate();
  }

  async function startWorker() {
    if (!worker) return;
    worker.postMessage(clientName);
  }

  async function stopWorker() {
    terminateWebWorker();
    await initWebWorker();
  }

  onMount(() => {
    initWebWorker();
  });

  onDestroy(() => {
    terminateWebWorker();
  });
</script>

<Card class="mt-10">
  <CardHeader>
    <CardTitle>PSD Mockup Generator</CardTitle>
    <CardDescription class="text-balance">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nesciunt, in.
      Quam deserunt accusamus atque eveniet, quos illum deleniti dolorem id,
      vero sunt cumque harum aliquid quo voluptatibus dolorum earum libero.
    </CardDescription>
  </CardHeader>

  <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
    <div class="space-y-4">
      <div class="">
        <Label for="name">Ismingizni kiriting:</Label>
        <Input
          id="name"
          name="name"
          autocomplete="name"
          bind:value={clientName}
        />
      </div>

      <Button on:click={startWorker}>Generate</Button>
    </div>

    <div class="row-start-1 md:row-start-auto">
      <AspectRatio ratio={16 / 9} class="overflow-hidden rounded-lg">
        <img
          src="https://mockupfree.co/wp-content/uploads/free-branding-psd-book-mockup-design-p2.webp"
          alt={"Temporary image"}
          class="object-cover object-center"
        />
      </AspectRatio>
    </div>
  </CardContent>
</Card>
