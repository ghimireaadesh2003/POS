import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Store, Users, Shield, Bell, CreditCard, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const staffMembers = [
  { id: '1', name: 'John Doe', role: 'Owner', email: 'john@ember.com', status: 'Active' },
  { id: '2', name: 'Maria Garcia', role: 'Manager', email: 'maria@ember.com', status: 'Active' },
  { id: '3', name: 'Ahmed Hassan', role: 'Cashier', email: 'ahmed@ember.com', status: 'Active' },
  { id: '4', name: 'Sophie Laurent', role: 'Waiter', email: 'sophie@ember.com', status: 'Active' },
  { id: '5', name: 'Kenji Tanaka', role: 'Kitchen Staff', email: 'kenji@ember.com', status: 'Active' },
  { id: '6', name: 'Priya Sharma', role: 'Waiter', email: 'priya@ember.com', status: 'Inactive' },
];

const auditLogs = [
  { action: 'Menu item updated', user: 'John Doe', time: '2 hours ago', detail: 'Wagyu Ribeye price changed to $58' },
  { action: 'Discount approved', user: 'Maria Garcia', time: '3 hours ago', detail: '15% off for Table 7' },
  { action: 'User role changed', user: 'John Doe', time: '5 hours ago', detail: 'Sophie Laurent: Cashier → Waiter' },
  { action: 'Order cancelled', user: 'Ahmed Hassan', time: '6 hours ago', detail: 'ORD-098 cancelled by customer request' },
];

const Settings: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('EMBER');
  const [serviceCharge, setServiceCharge] = useState('10');
  const [taxRate, setTaxRate] = useState('8.5');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your restaurant system</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="general"><Store className="w-4 h-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="staff"><Users className="w-4 h-4 mr-2" />Staff & Roles</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-2" />Payments</TabsTrigger>
          <TabsTrigger value="audit"><Shield className="w-4 h-4 mr-2" />Audit Log</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Restaurant Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cuisine Type</Label>
                <Input defaultValue="Italian Fine Dining" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="123 Culinary Ave, New York, NY 10001" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+1 (212) 555-0100" />
              </div>
              <div className="space-y-2">
                <Label>Service Charge (%)</Label>
                <Input value={serviceCharge} onChange={e => setServiceCharge(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input value={taxRate} onChange={e => setTaxRate(e.target.value)} type="number" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weekday Hours</Label>
                  <Input defaultValue="11:00 AM - 11:00 PM" />
                </div>
                <div className="space-y-2">
                  <Label>Weekend Hours</Label>
                  <Input defaultValue="10:00 AM - 12:00 AM" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        {/* Staff & Roles */}
        <TabsContent value="staff">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">Staff Members</h2>
              <Button size="sm">Add Staff</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map(member => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="secondary">{member.role}</Badge></td>
                      <td className="p-4 text-muted-foreground">{member.email}</td>
                      <td className="p-4">
                        <Badge className={member.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>{member.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="ghost">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Push Notifications', desc: 'Receive alerts for new orders and updates', state: notificationsEnabled, setter: setNotificationsEnabled },
                { label: 'Sound Alerts', desc: 'Play sound for new orders and kitchen updates', state: soundEnabled, setter: setSoundEnabled },
                { label: 'Auto-Accept Orders', desc: 'Automatically accept incoming orders', state: autoAcceptOrders, setter: setAutoAcceptOrders },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.state} onCheckedChange={item.setter} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Payment Configuration</h2>
            <div className="space-y-4">
              {[
                { method: 'Cash', enabled: true },
                { method: 'Credit/Debit Card', enabled: true },
                { method: 'UPI', enabled: false },
                { method: 'Digital Wallet', enabled: false },
              ].map(pm => (
                <div key={pm.method} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{pm.method}</span>
                  </div>
                  <Switch defaultChecked={pm.enabled} />
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input defaultValue="USD ($)" />
            </div>
          </div>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">Audit Log</h2>
              <p className="text-xs text-muted-foreground mt-1">Recent actions taken by staff members</p>
            </div>
            <div className="divide-y divide-border">
              {auditLogs.map((log, i) => (
                <div key={i} className="p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <span className="text-xs text-muted-foreground">· {log.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">by {log.user} — {log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
