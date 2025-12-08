import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const PropertyManagementContractContent = ({ contractData }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '40px',
        fontFamily: '"Times New Roman", serif',
        lineHeight: 1.8,
        fontSize: '12pt',
      }}
    >
      <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4, fontFamily: '"Times New Roman", serif' }}>
        PROPERTY MANAGEMENT SERVICES AGREEMENT
      </Typography>

      <Typography sx={{ textAlign: 'center', mb: 3, fontFamily: '"Times New Roman", serif' }}>
        (Compliant with Philippine Law - Civil Code, Corporation Code & Service Contract Act)
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          KNOW ALL MEN BY THESE PRESENTS:
        </Typography>

        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          This PROPERTY MANAGEMENT SERVICES AGREEMENT is entered into by and between:
        </Typography>

        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          <strong>{contractData.clientName || '[CLIENT/PROPERTY OWNER NAME]'}</strong>, of legal age, {contractData.clientCitizenship} citizen,
          with address at {contractData.clientAddress || '[CLIENT ADDRESS]'}, hereinafter referred to as the <strong>PRINCIPAL/OWNER</strong>;
        </Typography>

        <Typography paragraph sx={{ textAlign: 'center', fontFamily: '"Times New Roman", serif' }}>
          -and-
        </Typography>

        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          <strong>{contractData.managerBusinessName || '[PROPERTY MANAGEMENT COMPANY NAME]'}</strong>, a duly registered business entity
          under Philippine law, with principal office at {contractData.managerAddress || '[MANAGER ADDRESS]'},
          with TIN {contractData.managerTIN || '[TIN NUMBER]'}, represented by <strong>{contractData.managerName || '[AUTHORIZED REPRESENTATIVE]'}</strong>,
          hereinafter referred to as the <strong>PROPERTY MANAGER</strong>;
        </Typography>

        <Typography paragraph sx={{ textAlign: 'center', fontWeight: 'bold', mt: 3, mb: 2, fontFamily: '"Times New Roman", serif' }}>
          WITNESSETH: That
        </Typography>

        {/* Article I */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE I - SCOPE OF SERVICES
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          The PRINCIPAL hereby engages the PROPERTY MANAGER to provide comprehensive property management services for the property located at:
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif', pl: 4 }}>
          <strong>Property Address:</strong> {contractData.propertyAddress || '[PROPERTY ADDRESS]'},
          {contractData.propertyCity || '[CITY]'}, {contractData.propertyProvince || '[PROVINCE]'}, Philippines
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif', pl: 4 }}>
          <strong>Property Type:</strong> {contractData.propertyType || 'Residential'}
        </Typography>
        {contractData.propertyDescription && (
          <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif', pl: 4 }}>
            <strong>Description:</strong> {contractData.propertyDescription}
          </Typography>
        )}

        {/* Article II */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE II - MANAGEMENT SERVICES
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          The PROPERTY MANAGER shall perform the following services:
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          2.1. <strong>Tenant Management</strong> - Advertising, screening, selection, and placement of qualified tenants;
          preparation and execution of lease agreements; collection of rent and security deposits; handling tenant complaints and concerns.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          2.2. <strong>Rent Collection</strong> - Collection of monthly rental payments; issuance of official receipts;
          follow-up on delinquent accounts; enforcement of lease terms regarding payment.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          2.3. <strong>Property Maintenance</strong> - Regular inspection of the property; coordination with contractors and service providers
          for repairs and maintenance; emergency response for urgent repairs; ensuring property compliance with safety and building codes.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          2.4. <strong>Financial Reporting</strong> - Maintenance of detailed financial records; monthly reports on income and expenses;
          annual statements; tax documentation preparation assistance.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          2.5. <strong>Legal Compliance</strong> - Ensuring compliance with Philippine landlord-tenant laws; proper documentation;
          representation in legal matters related to property management (with PRINCIPAL's approval).
        </Typography>

        {/* Article III */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE III - MANAGEMENT FEES AND COMPENSATION
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          3.1. The PRINCIPAL shall pay the PROPERTY MANAGER a management fee of{' '}
          {contractData.managementFeePercentage ? (
            <>
              <strong>{contractData.managementFeePercentage}%</strong> of the gross monthly rental income collected
            </>
          ) : (
            <>
              a fixed monthly fee of <strong>₱{Number(contractData.managementFeeFixed || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
            </>
          )}.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          3.2. Management fees shall be deducted from collected rental income before remittance to the PRINCIPAL.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          3.3. Additional fees for extraordinary services (legal proceedings, major repairs coordination) shall be subject to prior agreement.
        </Typography>

        {/* Article IV */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE IV - REMITTANCE OF FUNDS
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          4.1. The PROPERTY MANAGER shall remit collected rental income, less management fees and authorized expenses,
          to the PRINCIPAL within fifteen (15) days from the end of each month.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          4.2. All remittances shall be accompanied by a detailed statement of account showing income, expenses, and deductions.
        </Typography>

        {/* Article V */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE V - AUTHORITY AND LIMITATIONS
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          5.1. The PROPERTY MANAGER is authorized to make ordinary repairs and maintenance not exceeding ₱10,000.00 per incident
          without prior approval from the PRINCIPAL.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          5.2. Major repairs, structural modifications, or capital improvements require prior written approval from the PRINCIPAL.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          5.3. The PROPERTY MANAGER may not sell, mortgage, or encumber the property without express written authority from the PRINCIPAL.
        </Typography>

        {/* Article VI */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE VI - TERM OF AGREEMENT
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          This Agreement shall be effective for a period of {contractData.serviceDuration || '12'} ({contractData.serviceDuration || '12'}) months
          from {contractData.leaseStartDate || '[START DATE]'} to {contractData.leaseEndDate || '[END DATE]'},
          unless earlier terminated as provided herein.
        </Typography>

        {/* Article VII */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE VII - TERMINATION
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          7.1. Either party may terminate this Agreement with sixty (60) days prior written notice to the other party.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          7.2. Upon termination, the PROPERTY MANAGER shall provide a final accounting, return all property documents,
          keys, and security deposits, and remit any remaining funds to the PRINCIPAL.
        </Typography>

        {/* Article VIII */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE VIII - INDEMNIFICATION AND LIABILITY
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          8.1. The PROPERTY MANAGER shall maintain professional liability insurance and shall indemnify the PRINCIPAL
          against losses arising from gross negligence or willful misconduct in the performance of duties.
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          8.2. The PROPERTY MANAGER shall not be liable for losses due to tenant default, natural disasters,
          or circumstances beyond reasonable control.
        </Typography>

        {/* Article IX */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
          ARTICLE IX - GOVERNING LAW
        </Typography>
        <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
          This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines.
        </Typography>

        {/* Special Provisions */}
        {contractData.specialProvisions && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE X - SPECIAL PROVISIONS
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              {contractData.specialProvisions}
            </Typography>
          </>
        )}

        {/* Signature Section */}
        <Box sx={{ mt: 6 }}>
          <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
            IN WITNESS WHEREOF, the parties have hereunto set their hands this {contractData.executionDate || '[DATE]'} at
            {contractData.executionPlace || '[PLACE]'}.
          </Typography>

          <Grid container spacing={8} sx={{ mt: 6 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>
                  {contractData.clientName || '[PRINCIPAL/OWNER NAME]'}
                </Typography>
                <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>PRINCIPAL/PROPERTY OWNER</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>
                  {contractData.managerName || '[AUTHORIZED REPRESENTATIVE]'}
                </Typography>
                <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>
                  {contractData.managerBusinessName || '[PROPERTY MANAGER]'}
                </Typography>
                <Typography sx={{ fontFamily: '"Times New Roman", serif', fontSize: '10pt' }}>
                  PROPERTY MANAGER
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              SIGNED IN THE PRESENCE OF:
            </Typography>
            <Grid container spacing={8} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                  <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Witness #1</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                  <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Witness #2</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyManagementContractContent;
