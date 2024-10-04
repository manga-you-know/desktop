import Database from '@tauri-apps/plugin-sql';
import type { MarkFavorites, Mark, Favorite } from '~/models';


export async function createMarkFavorite(favorite: Favorite, mark: Mark): Promise<void> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		await db.execute(
			'INSERT INTO mark_favorites (mark_id, favorite_id) VALUES (?, ?)',
			[mark.id, favorite.id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		db.close()
	}
}

export async function getMarkFavorites(favorite: Favorite): Promise<MarkFavorites[]> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		const markFavorites: MarkFavorites[] = await db.select(
			'SELECT * FROM mark_favorites WHERE favorite_id = ?', 
			[favorite.id]
		);
		return markFavorites
	} catch (error) {
		console.log(error)
		return [] 
	} finally {
		db.close()
	}
}

export async function deleteMarkFavorite(favorite: Favorite, mark: Mark): Promise<void> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		await db.execute(
			'DELETE FROM mark_favorites WHERE favorite_id = ? AND mark_id = ?',
			[favorite.id, mark.id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		db.close()
	}
}