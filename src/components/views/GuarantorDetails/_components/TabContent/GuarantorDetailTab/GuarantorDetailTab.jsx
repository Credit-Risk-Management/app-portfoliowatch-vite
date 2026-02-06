import { $guarantorDetailsData } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetail.consts';
import UniversalCard from '@src/components/global/UniversalCard/UniversalCard';
import { Row, Col } from 'react-bootstrap';

export function GuarantorDetailTab() {
  return (
    <UniversalCard headerText="Guarantor Details">
      <Row>
        <Col xs={12} md={6}>
          <div className="text-info-100 fw-200 mt-8">Name</div>
          <div className="text-info-50 lead fw-500">{$guarantorDetailsData.value?.name || 'N/A'}</div>
          <div className="text-info-100 fw-200 mt-8">Email</div>
          <div className="text-info-50 lead fw-500">{$guarantorDetailsData.value?.email || 'N/A'}</div>
          <div className="text-info-100 fw-200 mt-8">Phone</div>
          <div className="text-info-50 lead fw-500">{$guarantorDetailsData.value?.phone || 'N/A'}</div>
        </Col>
      </Row>
    </UniversalCard>
  );
}
export default GuarantorDetailTab;
