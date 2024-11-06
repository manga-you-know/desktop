import Database from "@tauri-apps/plugin-sql";
import { DATABASE_NAME } from "~/constants";
import type { Mark, User } from "~/models";

export async function createMark(mark: Mark): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const user = useState<User>("user");
  try {
    await db.execute(
      "INSERT INTO mark (user_id, name, user_id, color) VALUES (?, ?, ?, ?)",
      [user.value.id, mark.name, mark.user_id, mark.color],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function addMark(name: string): Promise<boolean> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const user = useState<User>("user");
  try {
    const marks = await getMarks();
    if (marks.find((mark) => mark.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    await db.execute(
      "INSERT INTO mark (user_id, name, color) VALUES (?, ?, ?)",
      [user.value.id, name, "#FF0000"],
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    // db.close()
  }
}

export async function getMarks(): Promise<Mark[]> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const user = useState<User>("user");
  try {
    const marks: Mark[] = await db.select(
      "SELECT * FROM mark WHERE user_id = ?",
      [user.value.id],
    );
    return marks;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    // db.close()
  }
}

export async function getMarkId(name: string): Promise<number> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  const user = useState<User>("user");
  try {
    const marks = await getMarks();
    const mark = marks.find(
      (mark) => mark.name.toLowerCase() === name.toLowerCase(),
    );
    if (mark) {
      return mark.id;
    }
    return -1;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    // db.close()
  }
}

export async function updateMark(mark: Mark): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute(
      "UPDATE mark SET name = ?, user_id = ?, color = ? WHERE id = ?",
      [mark.name, mark.user_id, mark.color, mark.id],
    );
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}

export async function deleteMark(mark: Mark): Promise<void> {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  try {
    await db.execute("DELETE FROM mark WHERE id = ? AND user_id = ?", [
      mark.id,
      mark.user_id,
    ]);
  } catch (error) {
    console.log(error);
  } finally {
    // db.close()
  }
}
