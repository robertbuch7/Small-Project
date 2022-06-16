<?php

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$IDArray[] = array();
		$stmt = $conn->prepare("SELECT FirstName, LastName, Email, Phone, DateCreated, ID FROM Contacts WHERE UserID=? AND FirstName LIKE ? UNION 
								SELECT FirstName, LastName, Email, Phone, DateCreated, ID FROM Contacts WHERE UserID=? AND LastName LIKE ?");
		$searchName = "%" . $inData["Search"] . "%";
		$stmt->bind_param("ssss", $inData["UserID"], $searchName, $inData["UserID"], $searchName);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"FirstName" : "' . $row["FirstName"] . '", "LastName" : "' . $row["LastName"] . '", 
							  "Email" : "' . $row["Email"] . '", "Phone" : "' . $row["Phone"] . '", "DateCreated" : "' . $row["DateCreated"] . '", "ID" : "' . $row["ID"] . '"}';
		}

		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>