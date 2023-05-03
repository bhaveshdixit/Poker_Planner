export interface Group {
  name: string;
  admin_name: string;
  existing_member_count: number;
}

interface GroupProps {
  group: Group;
  key: Number;
}

export const GroupCard = ({ group }: GroupProps) => {
  return (
    <div className='my-3 mt-4 card container-fluid shadow col-lg-5'>
      <div className='row p-2 d-flex'>
        <div className='col-lg-8 col-md-6 p-3'>
          <h5 className='mb-lg-0'>{group.name}</h5>
          <div className='d-flex pt-4'>
            <strong>Admin:&nbsp;</strong>
            <p>{group.admin_name}</p>
          </div>
        </div>
        <div className='col-lg-4 col-md-6 d-flex justify-content-end p-4'>
          <p className='mb-lg-0'>{group.existing_member_count} members</p>
        </div>
      </div>
    </div>
  );
};
