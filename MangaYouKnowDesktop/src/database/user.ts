import Database from '@tauri-apps/plugin-sql';
import type { User } from '~/models';

export async function createUser(user: User): Promise<void> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		await db.execute(
			'INSERT INTO user (username, email, icon, password) VALUES (?, ?, ?, ?)',
			[user.username, user.email, user.icon, user.password]
		);
	} catch (error) {
		console.log(error)
	} finally {
		db.close()
	}
}

export async function getUsers(): Promise<User[]> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		const user: User[] = await db.select('SELECT * FROM user WHERE username = ?');
		return user
	} catch (error) {
		console.log(error)
		throw new Error('User not found')
	} finally {
		db.close()
	}
}

export async function getDefaultUser(): Promise<User> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		const user: User[] = await db.select('SELECT * FROM user WHERE username = ?', ['admin']);
		if (user.length === 0) {
			createUser({
					username: 'admin',
					email: 'admin@example.com',
					icon: 'https://cdn.discordapp.com/embed/avatars/0.png',
				})
			const user: User[] = await db.select('SELECT * FROM user WHERE username = ?', ['admin']);
			return user[0]
		}
		return user[0]
	} catch (error) {
		console.log(error)
		throw new Error('User not found')
	} finally {
		db.close()
	}
}

export async function updateUser(user: User): Promise<void> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		await db.execute(
			'UPDATE user SET username = ?, email = ?, icon = ?, password = ? WHERE id = ?',
			[user.username, user.email, user.icon, user.password, user.id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		db.close()
	}
}

export async function deleteUser(user: User): Promise<void> {
	const db = await Database.load('sqlite:mykdata.db');
	try {
		await db.execute(
			'DELETE FROM user WHERE id = ?',
			[user.id]
		);
	} catch (error) {
		console.log(error)
	} finally {
		db.close()
	}
}