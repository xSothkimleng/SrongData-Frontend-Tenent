import { format } from 'date-fns';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMMM do, yyyy h:mm:ss');
};

export default formatDate;
