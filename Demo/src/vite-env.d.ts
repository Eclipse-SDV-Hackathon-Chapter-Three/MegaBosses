/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_MQTT_BROKER: string;
	readonly VITE_WS_ENDPOINT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
