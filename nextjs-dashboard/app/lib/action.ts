//By adding the 'use server', you mark all the exported functions within the file as server functions
'use server';
//In your actions.ts file, import Zod and define a schema that matches the shape of your form object. 
//This schema will validate the formData before saving it to a database.
import {date, z} from 'zod';
// insert data to DB
import { sql } from '@vercel/postgres';

//Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server. 
//You can do this with the revalidatePath function from Next.js:
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { error } from 'console';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce.number()
      .gt(0, {message: 'Please enter an amount greater than $0.'}), //change from a string to number with coerce
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status',
    }), // use enum as union type
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({id: true, date: true});

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData){
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // };
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    //console.log(validatedFields);
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
    
    //Tip: If you're working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). 
    //For example:
    //const rawData = Object.fromEntries(formData.entries())
    //test it out
    //console.log(rawFormData);
    //console.log(rawData);
    //type validation and coercion
    //console.log(typeof rawFormData.amount);// input return a string
    //we'll use Zod, a TypeScript-first validation library that can simplify this task for you.

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    //t's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;
    //Finally, let's create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
      } catch (error) {
        return {
          message: 'Database Error: Failed to Create Invoice.',
        };
    }
    //Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};
const UpdateInvoice = FormSchema.omit({id: true, date: true});
export async function updateInvoice(id: string, prevState: State, formData: FormData){
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
          `;
      } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
    revalidatePath('/dashboard/invoices');// to fresh the new table data
    redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string){
    //throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice' };
      } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice' };
      }
}