type Note = {
    id: string;
    title: string;
    content: string;
    is_pinned?: boolean;
    user_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

type NoteWithUser = Note & {
    user: {
        first_name: string,
        last_name: string,
        email: string,
        id: string
    }
}