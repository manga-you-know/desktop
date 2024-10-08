import Database from '@tauri-apps/plugin-sql';
import { DATABASE_NAME } from '~/constants';
import type { Mark, User } from '~/models';

export async function createMark(mark: Mark): Promise<void> {
	const db = await Database.load(`sqlite:${DATABASE_NAME}`);
	const user = useState<User>('user')
	try {
		await db.execute(
			'INSERT INTO mark (user_id, name, user_id, color) VALUES (?, ?, ?, ?)',
			[user.value.id, mark.name, mark.user_id, mark.color]
		);
	} catch (error) {
		console.log(error)
	} finally {
		// db.close()
	}
}

export async function getMarks(query: string = ''): Promise<Mark[]> {
	const db = await Database.load(`sqlite:${DATABASE_NAME}`);
	try {
		const user = useState<User>('user')
		if (query === '') {
			const marks: Mark[] = await db.select(
				'SELECT * FROM mark WHERE user_id = ?', 
				[user.value.id]
			);
			return marks
		} else {
			const marks: Mark[] = await db.select(
				'SELECT * FROM mark WHERE user_id = ? AND name LIKE "%?%"', 
				[user.value.id, query]
			);
			return marks
		}
	} catch (error) {
		console.log(error)
		return [] 
	} finally {
		// db.close()
	}
}
export async function updateMark(mark: Mark): Promise<void> {
	const db = await Database.load(`sqlite:${DATABASE_NAME}`);
	try {
		await db.execute(
			'UPDATE mark SET name = ?, user_id = ?, color = ? WHERE id = ?',
			[mark.name, mark.user_id, mark.color, mark.id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		// db.close()
	}
}

export async function deleteMark(mark: Mark): Promise<void> {
	const db = await Database.load(`sqlite:${DATABASE_NAME}`);
	try {
		await db.execute(
			'DELETE FROM mark WHERE id = ? AND user_id = ?',
			[mark.id, mark.user_id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		// db.close()
	}
}
