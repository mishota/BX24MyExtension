import { ObjectType } from "../enum/objectType";

export class LinkService {
    static get(type: string, id: string = ''): string | boolean {
        switch (type) {
            case ObjectType.document:
                return `/document/${id}`;
            case ObjectType.user:
                return `/user/${id}`;
        }
        return false;
    }
}