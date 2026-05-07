import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  data: any;
}

export default function OneProofSlipCard({ data }: Props) {
  // Try to safely extract typical payment fields from BCEL payload
  const amount = data?.amount || data?.txn_amount || data?.TotalAmount || '0.00';
  const currency = data?.currency || data?.ccy || 'LAK';
  const date = data?.date || data?.txn_date || data?.TxnDate || new Date().toLocaleString();
  const ticket = data?.ticket || data?.txn_id || data?.TicketID || data?.fccref || 'N/A';
  const status = data?.status || data?.state || 'SUCCESS';
  const username = data?.username || data?.name || data?.sender || data?.sender_name || data?.receiver || data?.receiver_name || data?.account_name || '';
  
  // Convert object to array to display generic fields if exact schema is unknown
  const entries = Object.entries(data || {}).filter(([key]) => 
    typeof data[key] === 'string' || typeof data[key] === 'number'
  );

  return (
    <View style={styles.container}>
      <View style={styles.receiptTop}>
        <View style={styles.notchLeft} />
        <View style={styles.notchRight} />
        
        <LinearGradient
          colors={['#d42026', '#b71c1c']}
          style={styles.headerGradient}
        >
          <MaterialCommunityIcons name="check-decagram" size={44} color="#fff" />
          <Text style={styles.headerTitle}>ໃບບິນຊຳລະເງິນ</Text>
          <Text style={styles.headerSubtitle}>ທຸລະກຳທີ່ກວດສອບແລ້ວ</Text>
        </LinearGradient>
      </View>

      <View style={styles.receiptBody}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>ຈຳນວນເງິນທັງໝົດ</Text>
          <Text style={styles.amountValue}>
            {Number(amount).toLocaleString()} <Text style={styles.currency}>{currency}</Text>
          </Text>
        </View>

        <View style={styles.dashedDivider}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.dashLine} />
          ))}
        </View>

        <View style={styles.detailsContainer}>
          {username ? <DetailRow label="ຊື່" value={username} /> : null}
          <DetailRow label="ວັນທີ" value={date} />
          <DetailRow label="ເລກອ້າງອີງ" value={ticket} />
          <DetailRow label="ສະຖານະ" value={status} valueColor="#00e676" />
          
          {/* Render extra generic fields if there are more */}
          {entries.slice(0, 6).map(([key, value]) => {
            const skipKeys = ['amount', 'txn_amount', 'TotalAmount', 'currency', 'ccy', 'date', 'txn_date', 'TxnDate', 'ticket', 'txn_id', 'TicketID', 'status', 'state', 'username', 'name', 'sender', 'sender_name', 'receiver', 'receiver_name', 'account_name'];
            if (skipKeys.includes(key.toLowerCase())) return null;
            return <DetailRow key={key} label={key.replace(/_/g, ' ').toUpperCase()} value={String(value)} />;
          })}
        </View>

        <View style={styles.footer}>
          <MaterialCommunityIcons name="shield-lock" size={16} color="#d42026" />
          <Text style={styles.footerText}>ຮັບປະກັນຄວາມປອດໄພໂດຍ BCEL OneSure</Text>
        </View>
      </View>
    </View>
  );
}

const DetailRow = ({ label, value, valueColor = '#212121' }: { label: string, value: string, valueColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, { color: valueColor }]} numberOfLines={2} ellipsizeMode="tail">
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: width - 48,
    alignSelf: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptTop: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 12,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  notchLeft: {
    position: 'absolute',
    bottom: -12,
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  notchRight: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  receiptBody: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 24,
  },
  amountContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
  dashedDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 24,
    overflow: 'hidden',
  },
  dashLine: {
    width: 6,
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  detailsContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '800',
    flex: 2,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#d42026',
    fontWeight: '700',
  },
});
