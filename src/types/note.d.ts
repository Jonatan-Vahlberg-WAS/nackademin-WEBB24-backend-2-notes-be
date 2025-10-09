type Note = {
    id: string;
    title: string;
    content: string;
    is_pinned?: boolean;
    user_id?: string | null;
    created_at?: string;
    updated_at?: string;
}