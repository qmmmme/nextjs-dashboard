'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback} from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const {replace} = useRouter();
  //This function will wrap the contents of handleSearch, and only run the code after a specific time once the user has stopped typing (300ms).
  const handleSearch = useDebouncedCallback((term: string) => {
    //URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters. Instead of creating a complex string literal, you can use it to get the params string like ?page=1&query=a
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    //Now that you have the query string. You can use Next.js's useRouter and usePathname hooks to update the URL.
  
  
    if(term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    //update URL with user search data
    replace(`${pathName}?${params?.toString()}`);// use optional chaining ?. to check whther it is null/undefined
    console.log(term);
    //now using npm i use-debounce
  }, 300);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()} // use optional chaining ?. to check whther it is null/undefined
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
