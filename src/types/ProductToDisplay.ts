import { Category } from './Category';
import { User } from './User';

export interface ProductToDisplay {
  id: string;
  name: string;
  category: Category;
  user: User;
}
