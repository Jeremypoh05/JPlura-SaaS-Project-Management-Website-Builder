'use client'
import React from 'react'
import { z } from 'zod'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'

interface SendInvitationProps {
    agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
    const { toast } = useToast()
    const { setClose, data } = useModal();
    const userDataSchema = z.object({
        email: z.string().email(),
        //enum can take one of a predefined set of values. ensures that the role field in the form data can only be set to one of the predefined values, preventing invalid or unexpected values from being entered.
        role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
    })

    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            role: 'SUBACCOUNT_USER',
        },
    })

    const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
        try {
            const res = await sendInvitation(values.role, values.email, agencyId)
            await saveActivityLogsNotification({
                agencyId: agencyId,
                description: `Invited ${res.email}`,
                subaccountId: undefined,
            })
            toast({
                title: 'Success',
                description: 'Created and sent invitation',
            })
        } catch (error) {
            console.log(error)
            toast({
                title: 'Success',
                description: 'Created and sent invitation',
                // variant: 'destructive',
                // title: 'Oppse!',
                // description: 'Could not send invitation',
            })
            setClose();
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invitation</CardTitle>
                <CardDescription>
                    An invitation will be sent to the user. Users who already have an
                    invitation sent out to their email, will not receive another
                    invitation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <FormField
                            disabled={form.formState.isSubmitting}
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={form.formState.isSubmitting}
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>User role</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user role..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                                            <SelectItem value="SUBACCOUNT_USER">
                                                Sub Account User
                                            </SelectItem>
                                            <SelectItem value="SUBACCOUNT_GUEST">
                                                Sub Account Guest
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit"
                        >
                            {form.formState.isSubmitting ? <Loading /> : 'Send Invitation'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SendInvitation