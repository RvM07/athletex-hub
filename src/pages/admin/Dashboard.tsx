import { useState } from "react";
import { 
  Users, Calendar, CreditCard, TrendingUp, 
  BarChart3, Clock, UserPlus, DollarSign,
  Menu, LogOut, Settings, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

const stats = [
  { name: "Total Members", value: "524", change: "+12%", icon: Users, color: "from-blue-500 to-cyan-500" },
  { name: "Today's Bookings", value: "48", change: "+8%", icon: Calendar, color: "from-green-500 to-emerald-500" },
  { name: "Revenue (Month)", value: "₹4.2L", change: "+15%", icon: CreditCard, color: "from-primary to-red-600" },
  { name: "New Sign-ups", value: "23", change: "+5%", icon: UserPlus, color: "from-purple-500 to-pink-500" },
];

const recentBookings = [
  { id: 1, member: "Rahul Kumar", type: "Personal Training", trainer: "Raj Sharma", time: "10:00 AM", status: "confirmed" },
  { id: 2, member: "Sneha Patil", type: "Yoga Class", trainer: "Priya Patel", time: "11:00 AM", status: "confirmed" },
  { id: 3, member: "Amit Deshmukh", type: "Gym Visit", trainer: "-", time: "6:00 PM", status: "pending" },
  { id: 4, member: "Pooja Sharma", type: "Zumba", trainer: "Ananya Desai", time: "7:00 PM", status: "confirmed" },
  { id: 5, member: "Vikrant Joshi", type: "MMA Class", trainer: "Vikram Singh", time: "8:00 PM", status: "confirmed" },
];

const recentMembers = [
  { id: 1, name: "Aarav Patel", plan: "6 Months", joined: "Today", avatar: "AP" },
  { id: 2, name: "Ishita Sharma", plan: "12 Months", joined: "Today", avatar: "IS" },
  { id: 3, name: "Rohan Mehta", plan: "3 Months", joined: "Yesterday", avatar: "RM" },
  { id: 4, name: "Diya Gupta", plan: "1 Month", joined: "Yesterday", avatar: "DG" },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border">
          <Link to="/">
            <Logo size="sm" showText={sidebarOpen} />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { name: "Dashboard", icon: BarChart3, active: true },
            { name: "Members", icon: Users },
            { name: "Bookings", icon: Calendar },
            { name: "Payments", icon: CreditCard },
            { name: "Trainers", icon: UserPlus },
            { name: "Reports", icon: TrendingUp },
            { name: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-display text-2xl">DASHBOARD</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              AD
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                </div>
                <h3 className="font-display text-3xl mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm">{stat.name}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2 glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">TODAY'S BOOKINGS</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-muted-foreground text-sm font-medium pb-3">Member</th>
                      <th className="text-left text-muted-foreground text-sm font-medium pb-3">Type</th>
                      <th className="text-left text-muted-foreground text-sm font-medium pb-3">Trainer</th>
                      <th className="text-left text-muted-foreground text-sm font-medium pb-3">Time</th>
                      <th className="text-left text-muted-foreground text-sm font-medium pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border/50 last:border-0">
                        <td className="py-4">{booking.member}</td>
                        <td className="py-4 text-muted-foreground">{booking.type}</td>
                        <td className="py-4 text-muted-foreground">{booking.trainer}</td>
                        <td className="py-4">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock size={14} />
                            {booking.time}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* New Members */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">NEW MEMBERS</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-muted-foreground text-xs">{member.plan}</p>
                    </div>
                    <span className="text-muted-foreground text-xs">{member.joined}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Add Member", icon: UserPlus },
              { name: "New Booking", icon: Calendar },
              { name: "Record Payment", icon: DollarSign },
              { name: "Generate Report", icon: BarChart3 },
            ].map((action) => (
              <Button
                key={action.name}
                variant="neonOutline"
                className="h-14 justify-start gap-3"
              >
                <action.icon size={20} />
                {action.name}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
