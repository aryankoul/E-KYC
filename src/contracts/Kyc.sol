pragma solidity >=0.4.21 <0.6.0;

contract Kyc {

    address owner;

    constructor() public {
        owner = msg.sender;
    }

    struct User {
        bool present;
        string signature;
        string emailHash;
        address payable[] vers;
        string[] verAddress;
    }

    struct Verifier{
        bool present;
        bool verified;
        string bank;
        string publicKey;
        string[] customers;
        mapping(string => string) encryptedCid;
    }

    address[] unverified;
    address[] verified;

    //To store verifier data with key : publickey
    mapping(address => Verifier) Verifiers;

    //From User's unique ID -> Verifier public key
    mapping(string => string) linkedVerifiers;

    mapping(string => address) homeVerifier;


    mapping(string => User) Users;


    function concat(string memory _a, string memory _b) public view returns (string memory){
        bytes memory bytes_a = bytes(_a);
        bytes memory bytes_b = bytes(_b);
        string memory length_ab = new string(bytes_a.length + bytes_b.length);
        bytes memory bytes_c = bytes(length_ab);
        uint k = 0;
        for (uint i = 0; i < bytes_a.length; i++) bytes_c[k++] = bytes_a[i];
        for (uint j = 0; j < bytes_b.length; j++) bytes_c[k++] = bytes_b[j];
        return string(bytes_c);
    }

    //concen
    function costShare(string memory userId, string memory cid, string memory vAddress)  public payable {
        bool flag = false;
        for(uint i = 0;i<Verifiers[msg.sender].customers.length;i++){
            if(keccak256(bytes(Verifiers[msg.sender].customers[i])) == keccak256(bytes(userId))){
                flag = true;
            }
        }
        if(flag==false){
            Verifiers[msg.sender].customers.push(userId);
            Users[userId].vers.push(msg.sender);
            Users[userId].verAddress.push(vAddress);
        }
        Verifiers[msg.sender].encryptedCid[userId] = cid;
        address payable[] memory v = Users[userId].vers;
        uint256 count = v.length;
        uint256 etherSent = msg.value;
        uint256 totalEth = msg.value/count;
        uint256 transferAmt = totalEth/(count-1);
        for(uint i = 0; i<v.length; i++){
            if(v[i] != msg.sender) {
                v[i].transfer(transferAmt);
                etherSent = etherSent-transferAmt;
            }
        }
        msg.sender.transfer(etherSent);

    }



    function updateCid(address newVerifierAddress, string memory userId, string  memory newEncryptedCid) public {
        address homeVerifierAddress = homeVerifier[userId];
        require(msg.sender == homeVerifierAddress,"Unauthorized update");
        Verifiers[newVerifierAddress].encryptedCid[userId] = newEncryptedCid;
        // for(uint i = 0;i<newVerifierAddress.length;i++){
        //     Verifiers[newVerifierAddress[i]].encryptedCid[userId] = newEncryptedCid[i];
        // }
    }

    function getCustomersList(address verifierAddress) public view returns(string memory){
        require(Verifiers[verifierAddress].verified == true, "Unauthorized verifier");
        string memory temp = "";
        for(uint i = 0;i<Verifiers[verifierAddress].customers.length;i++){
            if(i!=0){
             temp = concat(temp,"#");
             temp = concat(temp,Verifiers[verifierAddress].customers[i]);
            }
            else{
             temp = concat(temp,Verifiers[verifierAddress].customers[i]);
            }
        }
        return temp;
    }

    function getVerifiersList(string memory userId) public view returns(string memory){
        // require(homeVerifier[userId] == verifierAddress, "Unauthorized verifier");
        string memory temp = "";
        for(uint i = 0;i<Users[userId].verAddress.length;i++){
            if(i!=0){
             temp = concat(temp,"#");
             temp = concat(temp,Users[userId].verAddress[i]);
            }
            else{
             temp = concat(temp,Users[userId].verAddress[i]);
            }
        }
        return temp;
        // return Users[userId].verAddress;
    }

    function getCidForUser(string memory userId, address verifierAddress) public view returns(string memory){
        require(Users[userId].present==true,"User does not exists");
        return Verifiers[verifierAddress].encryptedCid[userId];
    }
    
    //For User Data

    function getUnverifiedVerifiers() public view returns (address[] memory) {
        require(msg.sender == owner, "Unauthorized");
        return unverified;
    }
    
    function pushVerifiers(address bankAddress, string memory bankName, string memory key) public returns (address[] memory){
        require(msg.sender == owner, "Unauthorized");
        string[] memory temp = new string[](0);
        Verifiers[bankAddress] = Verifier(true, true, bankName, key, temp);
        verified.push(bankAddress);
    }

    function getVerifiedVerifiers() public view returns (address[] memory){
        require(msg.sender == owner, "Unauthorized");
        return verified;
    }

     function getVerifier(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].bank;
    }

    function verifyVerifier(address verifierAddress) public returns(uint){
        require(msg.sender == owner, "Unauthorized");
        Verifiers[verifierAddress].verified = true;
        for(uint i = 0; i<unverified.length;i++){
            if(unverified[i] == verifierAddress) {

                verified.push(verifierAddress);
                
                unverified[i] = unverified[unverified.length - 1];
                delete unverified[unverified.length - 1];
                unverified.length--;
                return 1;
            }
        }
        return 0;
    }

    function getVerifierPublicKeyForUser(string memory _id) public view returns (string memory){
         require(Users[_id].present == true, "User does not exist");
        return (linkedVerifiers[_id]);
    }

    function addVerifier(string memory bankName, address verifierAddress, string memory publicKey) public {
        // require(msg.sender == owner,"Unauthorized");
        require(Verifiers[verifierAddress].present == false, "Verifier already exists");
        unverified.push(verifierAddress);
        string[] memory temp = new string[](0);
        Verifiers[verifierAddress] = Verifier(true, false, bankName, publicKey, temp);
    }

    function getPublicKey(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].publicKey;
    }

    function addUser(string memory _id,
                    string memory _signature,
                    string memory _emailHash,
                    string memory encryptedCid,
                    address payable verifierAddress,
                    string memory vAddress,
                    uint mode) public {
        require(Verifiers[verifierAddress].present == true, "Unauthorized verifier");
        if(mode==1){
            require(
            Users[_id].present == false,
            "User already exist");
            address payable[] memory ver = new address payable[](1);
            string[] memory verAddress = new string[](1);
            ver[0] = verifierAddress;
            verAddress[0] = vAddress;
            Users[_id] = User(true, _signature, _emailHash, ver, verAddress);
        }
        bool flag = false;
        for(uint i = 0;i<Verifiers[verifierAddress].customers.length;i++){
            if(keccak256(bytes(Verifiers[verifierAddress].customers[i])) == keccak256(bytes(_id)))
                flag = true;
        }
        if(flag==false){
            Verifiers[verifierAddress].customers.push(_id);
        }
        if(mode==3){
            Users[_id].signature = _signature;
            Users[_id].emailHash = _emailHash;
            if(flag==false){
                Users[_id].vers.push(verifierAddress);
                Users[_id].verAddress.push(vAddress);
            }
        }
        linkedVerifiers[_id] = getPublicKey(verifierAddress);
        homeVerifier[_id] = verifierAddress;
        Verifiers[verifierAddress].encryptedCid[_id] = encryptedCid;
    }

    function getUserCid(string memory userId, address verifierAddress) public returns(string memory) {
        require(Verifiers[verifierAddress].verified==true,"Unauthorized");
        return Verifiers[verifierAddress].encryptedCid[userId];
    }

    function getUserSignature(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return(Users[_id].signature);
    }

    function getUserEmailHash(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return (Users[_id].emailHash);
    }

    function present(address[] memory unverifiedAddresses,address current) public view returns (bool){
        for(uint i = 0; i<unverifiedAddresses.length;i++){
            if(unverified[i] == current) {
                return true;
            }
        }
        return false;
    }

    function identifyAddress(address currentAddress) public view returns (uint) {
        if(currentAddress == owner)
        {
            return 1;
        }
        else if(present(unverified,currentAddress))
        {
            return 3;
        }
        else if(Verifiers[currentAddress].present == true)
        {
            return 2;
        }
        return 4;
    }

}
