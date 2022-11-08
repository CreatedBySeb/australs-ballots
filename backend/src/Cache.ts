type FetchFunction<K, T> = (key: K) => Promise<T | undefined>;
type FetchAllFunction<K, T> = () => Promise<[K, T][]>;

export class Cache<T, K extends string | number = string> {
	protected cache: Map<K, T> = new Map();
	protected fetch: FetchFunction<K, T>;
	protected fetchAll: FetchAllFunction<K, T>;

	constructor(fetch: FetchFunction<K, T>, fetchAll: FetchAllFunction<K, T>) {
		this.fetch = fetch;
		this.fetchAll = fetchAll;
	}

	public async retrieve(key: K): Promise<T | undefined> {
		const cached = this.cache.get(key);

		if (cached) return cached;
		else {
			const item = await this.fetch(key);
			if (item) this.cache.set(key, item);
			return item;
		}
	}

	public async retrieveAll(): Promise<T[]> {
		const items = await this.fetchAll();

		items.forEach(([key, item]) => {
			this.cache.set(key, item);
		});

		return Array.from(this.cache.values());
	}
}