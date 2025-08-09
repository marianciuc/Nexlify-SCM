import type {SecurityScope} from '../api';
import type {TranslationPath} from '../generated-locale';

export enum MenuItemType {
    GROUP = 'group',
    ITEM = 'item',
}

export type Item = {
    title: TranslationPath;
    url: string;
    permission?: SecurityScope[];
    icon: React.ReactNode;
    type: MenuItemType;
    children?: Item[];
};
