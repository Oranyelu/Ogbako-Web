import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

export function RecentSales({ data = [] }: { data?: any[] }) {
    if (data.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent transactions.</div>
    }
    return (
        <div className="space-y-8">
            {data.map((t, i) => {
                const name = t.profiles?.full_name || 'Unknown';
                const email = t.profiles?.email || 'No email';
                const initials = name.slice(0, 2).toUpperCase();

                return (
                    <div key={t.id || i} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`/avatars/${(i % 5) + 1}.png`} alt="Avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{name}</p>
                            <p className="text-sm text-muted-foreground">
                                {email}
                            </p>
                        </div>
                        <div className={`ml-auto font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'INCOME' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
